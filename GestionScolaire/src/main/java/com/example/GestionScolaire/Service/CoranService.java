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
        System.out.println("=== upsertSeanceComplete ===");
        System.out.println("Date: " + request.getDate());
        System.out.println("ClasseId: " + request.getClasseId());
        System.out.println("EnseignantId: " + request.getEnseignantId());
        System.out.println("Versets: " + (request.getVersets() != null ? request.getVersets().size() : "null"));
        System.out.println("Recitations: " + (request.getRecitations() != null ? request.getRecitations().size() : "null"));

        try {
            // 1. Récupérer la classe et l'enseignant
            Classe classe = classeRepo.findById(request.getClasseId())
                    .orElseThrow(() -> new RuntimeException("Classe introuvable : " + request.getClasseId()));
            User enseignant = userRepo.findById(request.getEnseignantId())
                    .orElseThrow(() -> new RuntimeException("Enseignant introuvable : " + request.getEnseignantId()));

            // 2. Récupérer ou créer la séance du jour (par numéro de séance)
            int numSeance = request.getNumeroSeance() != null ? request.getNumeroSeance() : 1;
            SeanceRecitation seance = seanceRepo
                    .findByDateAndClasseIdAndNumeroSeance(request.getDate(), request.getClasseId(), numSeance)
                    .orElse(new SeanceRecitation());

            seance.setDate(request.getDate());
            seance.setNumeroSeance(numSeance);
            seance.setClasse(classe);
            seance.setEnseignant(enseignant);
            seance = seanceRepo.save(seance);
            System.out.println("Séance sauvegardée avec ID: " + seance.getId());

            // 3. Gérer les versets du jour — UPSERT (find-or-create)
            Map<String, VersetJour> versetParGroupe = new HashMap<>();

            if (request.getVersets() != null && !request.getVersets().isEmpty()) {
                for (VersetJourRequest req : request.getVersets()) {
                    // Validation obligatoire des versets
                    if (req.getVersetDebut() == null) {
                        throw CoranException.badRequest("Le verset de début est obligatoire pour le groupe \"" + req.getGroupeNiveau() + "\"");
                    }
                    if (req.getVersetFin() == null) {
                        throw CoranException.badRequest("Le verset de fin est obligatoire pour le groupe \"" + req.getGroupeNiveau() + "\"");
                    }
                    if (req.getVersetFin() < req.getVersetDebut()) {
                        throw CoranException.badRequest("Le verset de fin doit être >= au verset de début pour le groupe \"" + req.getGroupeNiveau() + "\"");
                    }

                    VersetJour verset = versetRepo
                            .findByDateAndClasseIdAndGroupeNiveau(
                                    req.getDate(), req.getClasseId(), req.getGroupeNiveau())
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

                    VersetJour saved = versetRepo.save(verset);
                    versetParGroupe.put(saved.getGroupeNiveau(), saved);
                }
            } else {
                versetRepo.findByDateAndClasseId(request.getDate(), request.getClasseId())
                        .forEach(v -> versetParGroupe.put(v.getGroupeNiveau(), v));
            }

            // Vérifier que des versets existent pour cette séance
            if (versetParGroupe.isEmpty()) {
                throw CoranException.badRequest(
                        "Aucun verset (début/fin) n'est défini pour cette séance. " +
                        "Veuillez renseigner les versets avant d'enregistrer les récitations.");
            }

            // 4. Supprimer les anciennes récitations de cette séance
            List<EleveRecitation> anciennesRecitations = recitationRepo.findBySeanceId(seance.getId());
            if (!anciennesRecitations.isEmpty()) {
                recitationRepo.deleteAll(anciennesRecitations);
                recitationRepo.flush();
            }

            // 5. Créer les nouvelles récitations
            boolean verifier = !Boolean.FALSE.equals(request.getVerifierRevision()); // true par défaut
            System.out.println("Traitement des récitations...");
            for (EleveRecitationRequest recReq : request.getRecitations()) {
                System.out.println("Traitement élève ID: " + recReq.getEleveId());

                Eleve eleve = eleveRepo.findById(recReq.getEleveId())
                        .orElseThrow(() -> new RuntimeException("Élève introuvable : " + recReq.getEleveId()));

                VersetJour verset = versetParGroupe.get(recReq.getGroupeNiveau());

                // Vérification révision : seulement si l'élève est présent et qu'un verset est assigné
                SeanceRevision revisionLiee = null;
                if (verifier && Boolean.TRUE.equals(recReq.getPresent()) && verset != null) {
                    List<SeanceRevision> revisions = revisionRepo.findRevisionsPourVerset(
                            eleve.getId(),
                            verset.getSourateNumero(),
                            verset.getVersetDebut(),
                            verset.getVersetFin(),
                            request.getDate());
                    if (revisions.isEmpty()) {
                        throw CoranException.badRequest(
                                "L'élève " + eleve.getPrenom() + " " + eleve.getNom() +
                                " n'a pas révisé les versets " + verset.getVersetDebut() +
                                " à " + verset.getVersetFin() +
                                " de la sourate " + verset.getSourateNom() +
                                ". Enregistrez d'abord une séance de révision.");
                    }
                    revisionLiee = revisions.get(0); // révision la plus récente couvrant ces versets
                }

                EleveRecitation recitation = EleveRecitation.builder()
                        .seance(seance)
                        .eleve(eleve)
                        .groupeNiveau(recReq.getGroupeNiveau())
                        .present(recReq.getPresent() != null && recReq.getPresent())
                        .niveauMemorisation(recReq.getNiveauMemorisation())
                        .commentaire(recReq.getCommentaire())
                        .versetJour(verset)
                        .seanceRevision(revisionLiee)
                        .build();

                recitationRepo.save(recitation);
            }

            System.out.println("Toutes les récitations ont été sauvegardées avec succès !");

            // 6. Retourner la réponse (séance courante uniquement)
            List<VersetJour> versets = versetRepo.findByDateAndClasseId(request.getDate(), request.getClasseId());
            List<EleveRecitation> recitations = recitationRepo.findBySeanceId(seance.getId());
            return toSeanceResponse(seance, versets, recitations);

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
        List<VersetJour> versets = versetRepo.findByDateAndClasseId(date, classeId);
        return seanceRepo.findByDateAndClasseIdOrderByNumeroSeanceAsc(date, classeId)
                .stream()
                .map(s -> toSeanceResponse(s, versets, recitationRepo.findBySeanceId(s.getId())))
                .toList();
    }

    @Transactional
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
                .numeroSeance(seance.getNumeroSeance())
                .classeId(seance.getClasse().getId())
                .classeNiveau(seance.getClasse().getNiveau())
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

        if (request.getVersetRevisionFin() < request.getVersetRevisionDebut()) {
            throw CoranException.badRequest("Le verset de fin doit être >= au verset de début");
        }

        SeanceRevision revision = SeanceRevision.builder()
                .date(request.getDate())
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
