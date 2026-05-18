package com.example.GestionScolaire.Controller;


import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Model.Paiement;
import com.example.GestionScolaire.Model.User;
import com.example.GestionScolaire.Service.PaiementService;
import com.example.GestionScolaire.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/paiements")
public class PaiementController {
    private final PaiementService paiementService;
    private final UserService userService;

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

    @PostMapping("/enregistrer")
    public ResponseEntity<Paiement> enregistrer(@RequestParam Long eleveId,
                                                @RequestParam Double montant,
                                                @RequestParam MotifPaiement motif,
                                                @RequestParam(required = false) Long moisId,
                                                @RequestParam Long userId) {
        User user = userService.findById(userId);
        return ResponseEntity.ok(
                paiementService.enregistrer(eleveId, montant, motif, moisId, user)
        );
    }
    @PutMapping("/{id}/valider")
    public ResponseEntity<Paiement> valider(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.valider(id));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<Paiement> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.annuler(id));
    }

}
