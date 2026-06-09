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
import com.example.GestionScolaire.Exception.CoranException;

@Service
@RequiredArgsConstructor
public class CoranService {

    private final SeanceRecitationRepository seanceRepo;
    private final EleveRecitationRepository recitationRepo;
    private final VersetJourRepository versetRepo;
    private final ClasseRepository classeRepo;
    private final EleveRepository eleveRepo;
    private final UserRepository userRepo;
    private final SeanceRevisionRepository revisionRepo;

    // ═══════════════════════════════════════════
    //  Versets du jour
    // ═══════════════════════════════════════════

    @Transactional
    public List<VersetJourResponse> getVersetsByDateAndClasse(LocalDate date, Long classeId) {
        return versetRepo.findByDateAndClasseId(date, classeId)
                .stream().map(this::toVersetResponse).toList();
    }

    @Transactional
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
        try {
            Classe classe = classeRepo.findById(request.getClasseId())
                    .orElseThrow(() -> CoranException.notFound("Classe introuvable : " + request.getClasseId()));
            User enseignant = userRepo.findById(request.getEnseignantId())
                    .orElseThrow(() -> CoranException.notFound("Enseignant introuvable : " + request.getEnseignantId()));

            int numSeance = request.getNumeroSeance() != null ? request.getNumeroSeance() : 1;
            SeanceRecitation seance = seanceRepo
                    .findByDateAndClasseIdAndNumeroSeance(request.getDate(), request.getClasseId(), numSeance)
                    .orElse(new SeanceRecitation());

            seance.setDate(request.getDate());
            seance.setNumeroSeance(numSeance);
            seance.setClasse(classe);
            seance.setEnseignant(enseignant);
            seance = seanceRepo.save(seance);

            // Supprimer les anciennes récitations
            List<EleveRecitation> anciennes = recitationRepo.findBySeanceId(seance.getId());
            if (!anciennes.isEmpty()) {
                recitationRepo.deleteAll(anciennes);
                recitationRepo.flush();
            }

            boolean verifier = !Boolean.FALSE.equals(request.getVerifierRevision());

            for (EleveRecitationRequest recReq : request.getRecitations()) {
                Eleve eleve = eleveRepo.findById(recReq.getEleveId())
                        .orElseThrow(() -> CoranException.notFound("Élève introuvable : " + recReq.getEleveId()));

                // Versets obligatoires si l'élève est présent
                if (Boolean.TRUE.equals(recReq.getPresent())) {
                    if (recReq.getVersetDebut() == null) {
                        throw CoranException.badRequest(
                                "Le verset de début est obligatoire pour " + eleve.getPrenom() + " " + eleve.getNom());
                    }
                    if (recReq.getVersetFin() == null) {
                        throw CoranException.badRequest(
                                "Le verset de fin est obligatoire pour " + eleve.getPrenom() + " " + eleve.getNom());
                    }
                    if (recReq.getVersetFin() < recReq.getVersetDebut()) {
                        throw CoranException.badRequest(
                                "Le verset de fin doit être >= au verset de début pour " + eleve.getPrenom() + " " + eleve.getNom());
                    }
                }

                // Vérification révision : l'élève doit avoir révisé ces versets
                SeanceRevision revisionLiee = null;
                if (verifier && Boolean.TRUE.equals(recReq.getPresent()) && recReq.getSourateNumero() != null) {
                    List<SeanceRevision> revisions = revisionRepo.findRevisionsPourVerset(
                            eleve.getId(),
                            recReq.getSourateNumero(),
                            recReq.getVersetDebut(),
                            recReq.getVersetFin(),
                            request.getDate());
                    if (revisions.isEmpty()) {
                        throw CoranException.badRequest(
                                "L'élève " + eleve.getPrenom() + " " + eleve.getNom() +
                                " n'a pas révisé les versets " + recReq.getVersetDebut() +
                                " à " + recReq.getVersetFin() +
                                (recReq.getSourateNom() != null ? " de la sourate " + recReq.getSourateNom() : "") +
                                ". Enregistrez d'abord une séance de révision.");
                    }
                    revisionLiee = revisions.get(0);
                }

                EleveRecitation recitation = EleveRecitation.builder()
                        .seance(seance)
                        .eleve(eleve)
                        .present(Boolean.TRUE.equals(recReq.getPresent()))
                        .versetDebut(recReq.getVersetDebut())
                        .versetFin(recReq.getVersetFin())
                        .sourateNumero(recReq.getSourateNumero())
                        .sourateNom(recReq.getSourateNom())
                        .sourateNomArabe(recReq.getSourateNomArabe())
                        .niveauMemorisation(recReq.getNiveauMemorisation())
                        .commentaire(recReq.getCommentaire())
                        .seanceRevision(revisionLiee)
                        .build();

                recitationRepo.save(recitation);
            }

            List<EleveRecitation> recitations = recitationRepo.findBySeanceId(seance.getId());
            return toSeanceResponse(seance, recitations);

        } catch (CoranException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("ERREUR dans upsertSeanceComplete: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'enregistrement: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════
    //  Lecture séances
    // ═══════════════════════════════════════════

    @Transactional
    public List<SeanceResponse> getSeancesByDate(LocalDate date, Long classeId) {
        return seanceRepo.findByDateAndClasseIdOrderByNumeroSeanceAsc(date, classeId)
                .stream()
                .map(s -> toSeanceResponse(s, recitationRepo.findBySeanceId(s.getId())))
                .toList();
    }

    @Transactional
    public List<SeanceResponse> getHistoriqueSeances(Long classeId, LocalDate dateDebut, LocalDate dateFin) {
        List<SeanceRecitation> seances = (dateDebut != null && dateFin != null)
                ? seanceRepo.findByClasseIdAndDateBetweenOrderByDateDesc(classeId, dateDebut, dateFin)
                : seanceRepo.findByClasseIdOrderByDateDesc(classeId);

        return seances.stream()
                .map(s -> toSeanceResponse(s, recitationRepo.findBySeanceId(s.getId())))
                .toList();
    }

    // ═══════════════════════════════════════════
    //  Récitations par élève
    // ═══════════════════════════════════════════

    @Transactional
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

    @Transactional
    public StatistiquesClasseResponse getStatistiquesClasse(
            Long classeId, LocalDate dateDebut, LocalDate dateFin) {

        Classe classe = classeRepo.findById(classeId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));

        List<EleveRecitation> toutesRecitations = (dateDebut != null && dateFin != null)
                ? recitationRepo.findByClasseIdAndDateRange(classeId, dateDebut, dateFin)
                : recitationRepo.findBySeanceClasseId(classeId);

        long totalSeances = (dateDebut != null && dateFin != null)
                ? seanceRepo.countSeancesParClasseAndDateRange(classeId, dateDebut, dateFin)
                : seanceRepo.countSeancesParClasse(classeId);

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
                .classeNiveau(classe.getNiveau())
                .totalSeances(totalSeances)
                .tauxPresenceMoyen(round2(tauxPresenceMoyen))
                .tauxMemorisationMoyen(round2(tauxMemoMoyen))
                .eleves(statsEleves)
                .build();
    }

    @Transactional
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
                .totalSeances(totalSeances)
                .nombrePresent(presents)
                .nombreMemorise(memorises)
                .nombrePartiel(partiels)
                .nombreNonMemorise(nonMemorises)
                .tauxPresence(round2(tauxPresence))
                .tauxMemorisation(round2(tauxMemo))
                .build();
    }

    private SeanceResponse toSeanceResponse(SeanceRecitation seance, List<EleveRecitation> recitations) {
        return SeanceResponse.builder()
                .id(seance.getId())
                .date(seance.getDate())
                .numeroSeance(seance.getNumeroSeance())
                .classeId(seance.getClasse().getId())
                .classeNiveau(seance.getClasse().getNiveau())
                .enseignantId(seance.getEnseignant().getId())
                .enseignantNom(seance.getEnseignant().getNom() + " " + seance.getEnseignant().getPrenom())
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
                .classeNiveau(v.getClasse().getNiveau())
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
                        .sourateNumero(r.getSourateNumero())
                        .sourateNom(r.getSourateNom())
                        .sourateNomArabe(r.getSourateNomArabe())
                        .versetDebut(r.getVersetDebut())
                        .versetFin(r.getVersetFin())
                        .present(r.isPresent())
                        .niveauMemorisation(r.getNiveauMemorisation())
                        .commentaire(r.getCommentaire());

        if (r.getSeanceRevision() != null) {
            builder.seanceRevisionId(r.getSeanceRevision().getId());
        }
        return builder.build();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // ═══════════════════════════════════════════
    //  Séances de révision
    // ═══════════════════════════════════════════

    @Transactional
    public SeanceRevisionResponse enregistrerRevision(SeanceRevisionRequest request) {
        Eleve eleve = eleveRepo.findById(request.getEleveId())
                .orElseThrow(() -> CoranException.notFound("Élève introuvable : " + request.getEleveId()));
        Classe classe = classeRepo.findById(request.getClasseId())
                .orElseThrow(() -> CoranException.notFound("Classe introuvable : " + request.getClasseId()));
        User enseignant = userRepo.findById(request.getEnseignantId())
                .orElseThrow(() -> CoranException.notFound("Enseignant introuvable : " + request.getEnseignantId()));

        if (request.getVersetRevisionDebut() == null) {
            throw CoranException.badRequest("Le verset de début de révision est obligatoire");
        }
        if (request.getVersetRevisionFin() == null) {
            throw CoranException.badRequest("Le verset de fin de révision est obligatoire");
        }
        if (request.getVersetRevisionFin() < request.getVersetRevisionDebut()) {
            throw CoranException.badRequest("Le verset de fin doit être >= au verset de début");
        }

        int numSeanceRevision = request.getNumeroSeance() != null ? request.getNumeroSeance() : 1;

        SeanceRevision revision = SeanceRevision.builder()
                .date(request.getDate())
                .numeroSeance(numSeanceRevision)
                .eleve(eleve)
                .classe(classe)
                .enseignant(enseignant)
                .sourateNumero(request.getSourateNumero())
                .sourateNom(request.getSourateNom())
                .sourateNomArabe(request.getSourateNomArabe())
                .versetRevisionDebut(request.getVersetRevisionDebut())
                .versetRevisionFin(request.getVersetRevisionFin())
                .commentaire(request.getCommentaire())
                .build();

        return toRevisionResponse(revisionRepo.save(revision));
    }

    @Transactional
    public List<SeanceRevisionResponse> getRevisionsByEleve(
            Long eleveId, LocalDate dateDebut, LocalDate dateFin) {
        List<SeanceRevision> revisions = (dateDebut != null && dateFin != null)
                ? revisionRepo.findByEleveIdAndDateBetween(eleveId, dateDebut, dateFin)
                : revisionRepo.findByEleveIdOrderByDateDesc(eleveId);
        return revisions.stream().map(this::toRevisionResponse).toList();
    }

    @Transactional
    public List<SeanceRevisionResponse> getRevisionsByClasse(
            Long classeId, LocalDate dateDebut, LocalDate dateFin) {
        List<SeanceRevision> revisions = (dateDebut != null && dateFin != null)
                ? revisionRepo.findByClasseIdAndDateBetween(classeId, dateDebut, dateFin)
                : revisionRepo.findByClasseIdOrderByDateDesc(classeId);
        return revisions.stream().map(this::toRevisionResponse).toList();
    }

    @Transactional
    public void supprimerRevision(Long id) {
        if (!revisionRepo.existsById(id)) {
            throw CoranException.notFound("Séance de révision introuvable : " + id);
        }
        revisionRepo.deleteById(id);
    }

    private SeanceRevisionResponse toRevisionResponse(SeanceRevision r) {
        return SeanceRevisionResponse.builder()
                .id(r.getId())
                .date(r.getDate())
                .numeroSeance(r.getNumeroSeance())
                .eleveId(r.getEleve().getId())
                .eleveNom(r.getEleve().getNom())
                .elevePrenom(r.getEleve().getPrenom())
                .matricule(r.getEleve().getMatricule())
                .classeId(r.getClasse().getId())
                .classeNiveau(r.getClasse().getNiveau())
                .enseignantId(r.getEnseignant().getId())
                .enseignantNom(r.getEnseignant().getNom() + " " + r.getEnseignant().getPrenom())
                .sourateNumero(r.getSourateNumero())
                .sourateNom(r.getSourateNom())
                .sourateNomArabe(r.getSourateNomArabe())
                .versetRevisionDebut(r.getVersetRevisionDebut())
                .versetRevisionFin(r.getVersetRevisionFin())
                .commentaire(r.getCommentaire())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
