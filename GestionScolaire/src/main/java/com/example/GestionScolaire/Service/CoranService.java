package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.DTO.CoranDTO;
import com.example.GestionScolaire.DTO.CoranDTO.*;
import com.example.GestionScolaire.Enum.NiveauMemorisation;
import com.example.GestionScolaire.Model.*;
import com.example.GestionScolaire.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoranService {

    private final SeanceRecitationRepository seanceRepo;
    private final EleveRecitationRepository recitationRepo;
    private final VersetJourRepository versetRepo;
    private final ClasseRepository classeRepo;
    private final EleveRepository eleveRepo;
    private final UserRepository userRepo;

    // ═══════════════════════════════════════════
    //  Versets du jour
    // ═══════════════════════════════════════════

    public List<VersetJourResponse> getVersetsByDateAndClasse(LocalDate date, Long classeId) {
        return versetRepo.findByDateAndClasseId(date, classeId)
                .stream().map(this::toVersetResponse).toList();
    }

    public List<VersetJourResponse> getHistoriqueVersets(Long classeId) {
        return versetRepo.findByClasseIdOrderByDateDesc(classeId)
                .stream().map(this::toVersetResponse).toList();
    }

    @Transactional
    public List<VersetJourResponse> upsertVersets(List<VersetJourRequest> requests) {
        List<VersetJour> saved = new ArrayList<>();

        for (VersetJourRequest req : requests) {
            Classe classe = classeRepo.findById(req.getClasseId())
                    .orElseThrow(() -> new RuntimeException("Classe introuvable : " + req.getClasseId()));
            User enseignant = userRepo.findById(req.getEnseignantId())
                    .orElseThrow(() -> new RuntimeException("Enseignant introuvable : " + req.getEnseignantId()));

            VersetJour verset = versetRepo
                    .findByDateAndClasseIdAndGroupeNiveau(req.getDate(), req.getClasseId(), req.getGroupeNiveau())
                    .orElse(new VersetJour());
            verset.setDate(req.getDate());
            verset.setSourateNumero(req.getSourateNumero());
            verset.setSourateNom(req.getSourateNom());
            verset.setSourateNomArabe(req.getSourateNomArabe());
            verset.setVersetDebut(req.getVersetDebut());
            verset.setVersetFin(req.getVersetFin());
            verset.setGroupeNiveau(req.getGroupeNiveau());
            verset.setClasse(classe);
            verset.setEnseignant(enseignant);

            saved.add(versetRepo.save(verset));
        }
        return saved.stream().map(this::toVersetResponse).toList();
    }

    // ═══════════════════════════════════════════
    //  Séances — Upsert complet
    // ═══════════════════════════════════════════

    @Transactional
    public SeanceResponse upsertSeanceComplete(SeanceRequest request) {
        Classe classe = classeRepo.findById(request.getClasseId())
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));
        User enseignant = userRepo.findById(request.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

        // 1. Récupérer ou créer la séance du jour
        SeanceRecitation seance = seanceRepo
                .findByDateAndClasseId(request.getDate(), request.getClasseId())
                .orElse(SeanceRecitation.builder()
                        .date(request.getDate())
                        .classe(classe)
                        .build());

        seance.setEnseignant(enseignant);
        seance = seanceRepo.save(seance);

        // 2. Upsert des versets du jour (si fournis)
        Map<String, VersetJour> versetParGroupe = new HashMap<>();
        if (request.getVersets() != null && !request.getVersets().isEmpty()) {
            List<VersetJourResponse> versetsUpserted = upsertVersets(request.getVersets());
            versetsUpserted.forEach(v -> {
                VersetJour vj = versetRepo.findById(v.getId()).orElseThrow();
                versetParGroupe.put(vj.getGroupeNiveau(), vj);
            });
        } else {
            versetRepo.findByDateAndClasseId(request.getDate(), request.getClasseId())
                    .forEach(v -> versetParGroupe.put(v.getGroupeNiveau(), v));
        }

        // 3. Upsert des récitations élèves
        final SeanceRecitation seanceFinal = seance;
        for (EleveRecitationRequest recReq : request.getRecitations()) {
            Eleve eleve = eleveRepo.findById(recReq.getEleveId())
                    .orElseThrow(() -> new RuntimeException("Élève introuvable : " + recReq.getEleveId()));

            EleveRecitation recitation = recitationRepo
                    .findBySeanceIdAndEleveId(seanceFinal.getId(), recReq.getEleveId())
                    .orElse(EleveRecitation.builder()
                            .seance(seanceFinal)
                            .eleve(eleve)
                            .build());

            recitation.setGroupeNiveau(recReq.getGroupeNiveau());
            recitation.setPresent(Boolean.TRUE.equals(recReq.getPresent()));
            recitation.setNiveauMemorisation(recReq.getNiveauMemorisation());
            recitation.setCommentaire(recReq.getCommentaire());

            VersetJour verset = versetParGroupe.get(recReq.getGroupeNiveau());
            if (verset == null && recReq.getVersetJourId() != null) {
                verset = versetRepo.findById(recReq.getVersetJourId()).orElse(null);
            }
            recitation.setVersetJour(verset);

            recitationRepo.save(recitation);
        }

        return getSeanceByDate(request.getDate(), request.getClasseId());
    }

    // ═══════════════════════════════════════════
    //  Lecture séances
    // ═══════════════════════════════════════════

    public SeanceResponse getSeanceByDate(LocalDate date, Long classeId) {
        SeanceRecitation seance = seanceRepo.findByDateAndClasseId(date, classeId)
                .orElseThrow(() -> new RuntimeException("Aucune séance trouvée pour cette date"));

        List<EleveRecitation> recitations = recitationRepo.findBySeanceId(seance.getId());
        List<VersetJour> versets = versetRepo.findByDateAndClasseId(date, classeId);

        return toSeanceResponse(seance, versets, recitations);
    }

    public List<SeanceResponse> getHistoriqueSeances(Long classeId, LocalDate dateDebut, LocalDate dateFin) {
        List<SeanceRecitation> seances = (dateDebut != null && dateFin != null)
                ? seanceRepo.findByClasseIdAndDateBetweenOrderByDateDesc(classeId, dateDebut, dateFin)
                : seanceRepo.findByClasseIdOrderByDateDesc(classeId);

        return seances.stream().map(s -> {
            List<EleveRecitation> recs = recitationRepo.findBySeanceId(s.getId());
            List<VersetJour> vjs = versetRepo.findByDateAndClasseId(s.getDate(), classeId);
            return toSeanceResponse(s, vjs, recs);
        }).toList();
    }

    // ═══════════════════════════════════════════
    //  Récitations par élève
    // ═══════════════════════════════════════════

    public List<EleveRecitationResponse> getRecitationsByEleve(
            Long eleveId, LocalDate dateDebut, LocalDate dateFin) {
        List<EleveRecitation> recs = (dateDebut != null && dateFin != null)
                ? recitationRepo.findByEleveIdAndDateRange(eleveId, dateDebut, dateFin)
                : recitationRepo.findByEleveId(eleveId);
        return recs.stream().map(this::toRecitationResponse).toList();
    }

    // ═══════════════════════════════════════════
    //  Statistiques
    // ═══════════════════════════════════════════

    public StatistiquesClasseResponse getStatistiquesClasse(
            Long classeId, LocalDate dateDebut, LocalDate dateFin) {

        Classe classe = classeRepo.findById(classeId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));

        List<EleveRecitation> toutesRecitations =
                recitationRepo.findByClasseIdAndOptionalDateRange(classeId, dateDebut, dateFin);

        long totalSeances = seanceRepo.countSeancesParClasse(classeId, dateDebut, dateFin);

        Map<Long, List<EleveRecitation>> parEleve = toutesRecitations.stream()
                .collect(Collectors.groupingBy(r -> r.getEleve().getId()));

        List<StatistiquesEleveResponse> statsEleves = parEleve.entrySet().stream()
                .map(entry -> buildStatEleve(entry.getKey(), entry.getValue(), totalSeances))
                .sorted(Comparator.comparing(StatistiquesEleveResponse::getEleveNom))
                .toList();

        double tauxPresenceMoyen = statsEleves.stream()
                .mapToDouble(StatistiquesEleveResponse::getTauxPresence)
                .average().orElse(0.0);

        double tauxMemoMoyen = statsEleves.stream()
                .mapToDouble(StatistiquesEleveResponse::getTauxMemorisation)
                .average().orElse(0.0);

        return StatistiquesClasseResponse.builder()
                .classeId(classeId)
                .classeNiveau(classe.getNiveau())  // ✅ Utilisation de NiveauClasse (enum)
                .totalSeances(totalSeances)
                .tauxPresenceMoyen(round2(tauxPresenceMoyen))
                .tauxMemorisationMoyen(round2(tauxMemoMoyen))
                .eleves(statsEleves)
                .build();
    }

    public StatistiquesEleveResponse getStatistiquesEleve(Long eleveId) {
        List<EleveRecitation> recitations = recitationRepo.findByEleveId(eleveId);
        long totalSeances = recitations.size();
        return buildStatEleve(eleveId, recitations, totalSeances);
    }

    // ═══════════════════════════════════════════
    //  Helpers internes
    // ═══════════════════════════════════════════

    private StatistiquesEleveResponse buildStatEleve(
            Long eleveId, List<EleveRecitation> recitations, long totalSeances) {

        if (recitations.isEmpty()) {
            return StatistiquesEleveResponse.builder()
                    .eleveId(eleveId)
                    .build();
        }

        EleveRecitation first = recitations.get(0);
        long presents = recitations.stream().filter(EleveRecitation::isPresent).count();
        long memorises = recitations.stream()
                .filter(r -> r.isPresent() && r.getNiveauMemorisation() == NiveauMemorisation.MEMORISE)
                .count();
        long partiels = recitations.stream()
                .filter(r -> r.isPresent() && r.getNiveauMemorisation() == NiveauMemorisation.PARTIEL)
                .count();
        long nonMemorises = recitations.stream()
                .filter(r -> r.isPresent() && r.getNiveauMemorisation() == NiveauMemorisation.NON_MEMORISE)
                .count();

        double tauxPresence = totalSeances > 0 ? (double) presents / totalSeances * 100 : 0;
        double tauxMemo = presents > 0 ? (double) memorises / presents * 100 : 0;

        return StatistiquesEleveResponse.builder()
                .eleveId(eleveId)
                .eleveNom(first.getEleve().getNom())
                .elevePrenom(first.getEleve().getPrenom())
                .matricule(first.getEleve().getMatricule())
                .groupeNiveau(first.getGroupeNiveau())
                .totalSeances(totalSeances)
                .nombrePresent(presents)
                .nombreMemorise(memorises)
                .nombrePartiel(partiels)
                .nombreNonMemorise(nonMemorises)
                .tauxPresence(round2(tauxPresence))
                .tauxMemorisation(round2(tauxMemo))
                .build();
    }

    private SeanceResponse toSeanceResponse(
            SeanceRecitation seance,
            List<VersetJour> versets,
            List<EleveRecitation> recitations) {
        return SeanceResponse.builder()
                .id(seance.getId())
                .date(seance.getDate())
                .classeId(seance.getClasse().getId())
                .classeNiveau(seance.getClasse().getNiveau())  // ✅ Utilisation de NiveauClasse
                .enseignantId(seance.getEnseignant().getId())
                .enseignantNom(seance.getEnseignant().getNom() + " " + seance.getEnseignant().getPrenom())
                .versets(versets.stream().map(this::toVersetResponse).toList())
                .recitations(recitations.stream().map(this::toRecitationResponse).toList())
                .createdAt(seance.getCreatedAt())
                .updatedAt(seance.getUpdatedAt())
                .build();
    }

    private VersetJourResponse toVersetResponse(VersetJour v) {
        return VersetJourResponse.builder()
                .id(v.getId())
                .date(v.getDate())
                .sourateNumero(v.getSourateNumero())
                .sourateNom(v.getSourateNom())
                .sourateNomArabe(v.getSourateNomArabe())
                .versetDebut(v.getVersetDebut())
                .versetFin(v.getVersetFin())
                .groupeNiveau(v.getGroupeNiveau())
                .classeId(v.getClasse().getId())
                .classeNiveau(v.getClasse().getNiveau())  // ✅ Utilisation de NiveauClasse
                .enseignantId(v.getEnseignant().getId())
                .enseignantNom(v.getEnseignant().getNom() + " " + v.getEnseignant().getPrenom())
                .createdAt(v.getCreatedAt())
                .build();
    }

    private EleveRecitationResponse toRecitationResponse(EleveRecitation r) {
        EleveRecitationResponse.EleveRecitationResponseBuilder builder =
                EleveRecitationResponse.builder()
                        .id(r.getId())
                        .seanceId(r.getSeance().getId())
                        .eleveId(r.getEleve().getId())
                        .eleveNom(r.getEleve().getNom())
                        .elevePrenom(r.getEleve().getPrenom())
                        .matricule(r.getEleve().getMatricule())
                        .groupeNiveau(r.getGroupeNiveau())
                        .present(r.isPresent())
                        .niveauMemorisation(r.getNiveauMemorisation())
                        .commentaire(r.getCommentaire());

        if (r.getVersetJour() != null) {
            builder.versetJourId(r.getVersetJour().getId())
                    .sourateNom(r.getVersetJour().getSourateNom())
                    .sourateNomArabe(r.getVersetJour().getSourateNomArabe())
                    .versetDebut(r.getVersetJour().getVersetDebut())
                    .versetFin(r.getVersetJour().getVersetFin());
        }
        return builder.build();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}