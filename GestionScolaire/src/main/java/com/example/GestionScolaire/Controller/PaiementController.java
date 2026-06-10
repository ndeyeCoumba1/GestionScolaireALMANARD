package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.DTO.PaiementDTO;
import com.example.GestionScolaire.DTO.PaiementSearchDTO;
import com.example.GestionScolaire.DTO.SituationPaiementDTO;
import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import com.example.GestionScolaire.Model.Paiement;
import com.example.GestionScolaire.Model.User;
import com.example.GestionScolaire.Service.PaiementService;
import com.example.GestionScolaire.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "*")
public class PaiementController {

    private final PaiementService paiementService;
    private final UserService     userService;

    // ── helpers ────────────────────────────────────────────────────────────
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        return userService.findByEmail(auth.getName());
    }

    // ═══════════════════════════════════════════
    //  Lecture de base
    // ═══════════════════════════════════════════

    @GetMapping
    public ResponseEntity<List<Paiement>> findAll() {
        return ResponseEntity.ok(paiementService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paiement> findById(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.findById(id));
    }

    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<Paiement>> findByEleve(@PathVariable Long eleveId) {
        return ResponseEntity.ok(paiementService.findByEleve(eleveId));
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<Paiement>> findEnAttente() {
        return ResponseEntity.ok(paiementService.findEnAttente());
    }

    // ═══════════════════════════════════════════
    //  Totaux & statistiques
    // ═══════════════════════════════════════════

    @GetMapping("/total/annee/{anneeId}")
    public ResponseEntity<Double> totalParAnnee(@PathVariable Long anneeId) {
        return ResponseEntity.ok(paiementService.totalParAnnee(anneeId));
    }

    @GetMapping("/total/periode")
    public ResponseEntity<Double> totalParPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(paiementService.totalParPeriode(debut, fin));
    }

    @GetMapping("/stats/annee/{anneeId}")
    public ResponseEntity<List<Object[]>> statsParMois(@PathVariable Long anneeId) {
        return ResponseEntity.ok(paiementService.statsParMois(anneeId));
    }

    // ═══════════════════════════════════════════
    //  Situation par inscription (EXPOSÉ ICI)
    // ═══════════════════════════════════════════

    /**
     * GET /api/paiements/inscription/{inscriptionId}
     * Frais d'inscription : total, payé, restant + historique.
     */
    @GetMapping("/inscription/{inscriptionId}")
    public ResponseEntity<SituationPaiementDTO> getSituationByInscription(
            @PathVariable Long inscriptionId) {
        return ResponseEntity.ok(paiementService.getSituationByInscription(inscriptionId));
    }

    // ═══════════════════════════════════════════
    //  Situation annuelle d'un élève
    // ═══════════════════════════════════════════

    /**
     * GET /api/paiements/situation-annuelle?eleveId=&anneeId=
     * Vue mois par mois : montant attendu, payé, reste, statut.
     */
    @GetMapping("/situation-annuelle")
    public ResponseEntity<PaiementSearchDTO.SituationAnnuelleEleveDTO> getSituationAnnuelle(
            @RequestParam Long eleveId,
            @RequestParam Long anneeId) {
        return ResponseEntity.ok(paiementService.getSituationAnnuelleEleve(eleveId, anneeId));
    }

    // ═══════════════════════════════════════════
    //  Impayés par classe
    // ═══════════════════════════════════════════

    /**
     * GET /api/paiements/impayés?classeId=&moisId=
     * Liste des élèves n'ayant pas payé pour un mois donné.
     */
    @GetMapping("/impayés")
    public ResponseEntity<List<PaiementSearchDTO.EleveImpayeDTO>> getImpayesByClasse(
            @RequestParam Long classeId,
            @RequestParam Long moisId) {
        return ResponseEntity.ok(paiementService.getImpayesByClasse(classeId, moisId));
    }

    // ═══════════════════════════════════════════
    //  Taux de recouvrement
    // ═══════════════════════════════════════════

    /**
     * GET /api/paiements/taux-recouvrement?anneeId=&moisId=
     * Nombre et % d'élèves ayant payé le mois indiqué.
     */
    @GetMapping("/taux-recouvrement")
    public ResponseEntity<PaiementSearchDTO.TauxRecouvrementDTO> getTauxRecouvrement(
            @RequestParam Long anneeId,
            @RequestParam Long moisId) {
        return ResponseEntity.ok(paiementService.getTauxRecouvrement(anneeId, moisId));
    }

    // ═══════════════════════════════════════════
    //  Recherche multi-critères
    // ═══════════════════════════════════════════

    /**
     * GET /api/paiements/recherche?anneeId=&moisId=&statut=&classeId=
     * Tous les paramètres sont optionnels — les non-fournis ne filtrent pas.
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<PaiementDTO>> rechercher(
            @RequestParam(required = false) Long anneeId,
            @RequestParam(required = false) Long moisId,
            @RequestParam(required = false) StatutPaiement statut,
            @RequestParam(required = false) Long classeId) {
        return ResponseEntity.ok(paiementService.rechercher(anneeId, moisId, statut, classeId));
    }

    // ═══════════════════════════════════════════
    //  Enregistrement
    // ═══════════════════════════════════════════

    @PostMapping("/enregistrer")
    public ResponseEntity<Paiement> enregistrer(
            @RequestParam Long eleveId,
            @RequestParam Double montant,
            @RequestParam(required = false) Double montantAttendu,
            @RequestParam MotifPaiement motif,
            @RequestParam TypePaiement typePaiement,
            @RequestParam(required = false) Long moisId,
            @RequestParam(required = false) Long inscriptionId) {

        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(
                paiementService.enregistrer(eleveId, montant, montantAttendu,
                        typePaiement, motif, moisId, inscriptionId, user));
    }

    // ═══════════════════════════════════════════
    //  Modification
    // ═══════════════════════════════════════════

    @PutMapping("/{id}/modifier")
    public ResponseEntity<Paiement> modifier(
            @PathVariable Long id,
            @RequestParam Double montant,
            @RequestParam(required = false) Double montantAttendu,
            @RequestParam MotifPaiement motif,
            @RequestParam TypePaiement typePaiement,
            @RequestParam(required = false) Long moisId,
            @RequestParam(required = false) Long inscriptionId) {

        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(
                paiementService.modifier(id, montant, montantAttendu,
                        typePaiement, motif, moisId, inscriptionId, user));
    }

    // ═══════════════════════════════════════════
    //  Validation / Annulation / Suppression
    // ═══════════════════════════════════════════

    @PutMapping("/{id}/valider")
    public ResponseEntity<Paiement> valider(@PathVariable Long id) {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(paiementService.valider(id, user));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<Paiement> annuler(@PathVariable Long id) {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(paiementService.annuler(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        paiementService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}