package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.DTO.CoranDTO;
import com.example.GestionScolaire.Service.CoranService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/coran")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CoranController {
    private final CoranService coranService;

    // ═══════════════════════════════════════════
    //  Versets du jour
    // ═══════════════════════════════════════════

    /**
     * GET /api/coran/versets-jour?date=2026-05-22&classeId=1
     * Récupère les versets du jour pour une classe
     */
    @GetMapping("/versets-jour")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.VersetJourResponse>> getVersetsDuJour(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long classeId) {
        return ResponseEntity.ok(coranService.getVersetsByDateAndClasse(date, classeId));
    }

    /**
     * GET /api/coran/versets-jour/historique?classeId=1
     * Historique de tous les versets assignés à une classe
     */
    @GetMapping("/versets-jour/historique")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.VersetJourResponse>> getHistoriqueVersets(
            @RequestParam Long classeId) {
        return ResponseEntity.ok(coranService.getHistoriqueVersets(classeId));
    }

    /**
     * POST /api/coran/versets-jour
     * Définit (ou met à jour) les versets du jour pour chaque groupe
     */
    @PostMapping("/versets-jour")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.VersetJourResponse>> upsertVersets(
            @RequestBody @Valid List<CoranDTO.VersetJourRequest> requests) {
        return ResponseEntity.ok(coranService.upsertVersets(requests));
    }

    // ═══════════════════════════════════════════
    //  Séances
    // ═══════════════════════════════════════════

    /**
     * POST /api/coran/seances
     * Crée ou met à jour une séance complète (versets + présences + mémorisation)
     */
    @PostMapping("/seances")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'RECITATEUR')")
    public ResponseEntity<CoranDTO.SeanceResponse> upsertSeance(
            @RequestBody @Valid CoranDTO.SeanceRequest request) {
        return ResponseEntity.ok(coranService.upsertSeanceComplete(request));
    }

    /**
     * GET /api/coran/seances/date?date=2026-05-22&classeId=1
     * Récupère toutes les séances d'un jour donné pour une classe (ordonnées par numéro)
     */
    @GetMapping("/seances/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.SeanceResponse>> getSeancesByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long classeId) {
        return ResponseEntity.ok(coranService.getSeancesByDate(date, classeId));
    }

    /**
     * GET /api/coran/seances/historique?classeId=1&dateDebut=2026-01-01&dateFin=2026-05-31
     * Historique des séances d'une classe avec filtres optionnels de dates
     */
    @GetMapping("/seances/historique")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.SeanceResponse>> getHistoriqueSeances(
            @RequestParam Long classeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(coranService.getHistoriqueSeances(classeId, dateDebut, dateFin));
    }

    // ═══════════════════════════════════════════
    //  Récitations par élève
    // ═══════════════════════════════════════════

    /**
     * GET /api/coran/recitations/eleve/5?dateDebut=2026-01-01&dateFin=2026-05-31
     * Historique de récitation d'un élève spécifique
     */
    @GetMapping("/recitations/eleve/{eleveId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.EleveRecitationResponse>> getRecitationsByEleve(
            @PathVariable Long eleveId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(
                coranService.getRecitationsByEleve(eleveId, dateDebut, dateFin));
    }

    // ═══════════════════════════════════════════
    //  Statistiques
    // ═══════════════════════════════════════════

    /**
     * GET /api/coran/stats/classe/1?dateDebut=2026-01-01&dateFin=2026-05-31
     * Statistiques de présence et mémorisation pour toute la classe
     */
    @GetMapping("/stats/classe/{classeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<CoranDTO.StatistiquesClasseResponse> getStatistiquesClasse(
            @PathVariable Long classeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(
                coranService.getStatistiquesClasse(classeId, dateDebut, dateFin));
    }

    /**
     * GET /api/coran/stats/eleve/5
     * Statistiques globales d'un élève (toutes séances confondues)
     */
    @GetMapping("/stats/eleve/{eleveId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<CoranDTO.StatistiquesEleveResponse> getStatistiquesEleve(
            @PathVariable Long eleveId) {
        return ResponseEntity.ok(coranService.getStatistiquesEleve(eleveId));
    }

    // ═══════════════════════════════════════════
    //  Séances de révision
    // ═══════════════════════════════════════════

    /**
     * POST /api/coran/revisions
     * Enregistre une séance de révision pour un élève
     */
    @PostMapping("/revisions")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'RECITATEUR')")
    public ResponseEntity<CoranDTO.SeanceRevisionResponse> enregistrerRevision(
            @RequestBody @Valid CoranDTO.SeanceRevisionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(coranService.enregistrerRevision(request));
    }

    /**
     * GET /api/coran/revisions/eleve/{eleveId}?dateDebut=2026-01-01&dateFin=2026-06-30
     * Historique des révisions d'un élève
     */
    @GetMapping("/revisions/eleve/{eleveId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.SeanceRevisionResponse>> getRevisionsByEleve(
            @PathVariable Long eleveId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(coranService.getRevisionsByEleve(eleveId, dateDebut, dateFin));
    }

    /**
     * GET /api/coran/revisions/classe/{classeId}?dateDebut=2026-01-01&dateFin=2026-06-30
     * Toutes les révisions d'une classe
     */
    @GetMapping("/revisions/classe/{classeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'COMPTABLE', 'RECITATEUR')")
    public ResponseEntity<List<CoranDTO.SeanceRevisionResponse>> getRevisionsByClasse(
            @PathVariable Long classeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(coranService.getRevisionsByClasse(classeId, dateDebut, dateFin));
    }

    /**
     * DELETE /api/coran/revisions/{id}
     * Supprime une séance de révision
     */
    @DeleteMapping("/revisions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT', 'RECITATEUR')")
    public ResponseEntity<Void> supprimerRevision(@PathVariable Long id) {
        coranService.supprimerRevision(id);
        return ResponseEntity.noContent().build();
    }
}
