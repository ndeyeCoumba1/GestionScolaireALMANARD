package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.DTO.InscriptionDTO;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Inscription;
import com.example.GestionScolaire.Service.AnneeService;
import com.example.GestionScolaire.Service.InscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inscriptions")
@CrossOrigin(origins = "*")
public class InscriptionController {
    private final InscriptionService inscriptionService;
    private final AnneeService anneeService;

    @GetMapping
    public ResponseEntity<List<Inscription>> findAll() {
        return ResponseEntity.ok(inscriptionService.findAll());
    }

    @GetMapping("/annee/{anneeId}")
    public ResponseEntity<List<Inscription>> findByAnnee(@PathVariable Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return ResponseEntity.ok(inscriptionService.findByAnnee(annee));
    }

    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<Inscription>> findByEleve(@PathVariable Long eleveId) {
        return ResponseEntity.ok(inscriptionService.findByEleve(eleveId));
    }
    @GetMapping("/annee/{anneeId}/count")
    public ResponseEntity<Long> countByAnnee(@PathVariable Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return ResponseEntity.ok(inscriptionService.countByAnnee(annee));
    }

    @PostMapping("/inscrire")
    public ResponseEntity<Inscription> inscrire(@RequestParam Long eleveId,
                                                @RequestParam Long classeId,
                                                @RequestParam double fraisInscription) {
        return ResponseEntity.ok(inscriptionService.inscrire(eleveId, classeId, fraisInscription));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inscription> findById(@PathVariable Long id) {
        return ResponseEntity.ok(inscriptionService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inscription> update(@PathVariable Long id,
                                              @RequestBody InscriptionDTO request) {
        return ResponseEntity.ok(inscriptionService.updateFrais(id, request.getFraisInscription()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
