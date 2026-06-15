package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.Model.Mois;
import com.example.GestionScolaire.Service.MoisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mois")
@RequiredArgsConstructor
public class MoisController {

    private final MoisService moisService;

    /**
     * GET /api/mois            → tous les mois (toutes années)
     * GET /api/mois?anneeId=1  → mois de l'année 1 uniquement
     */
    @GetMapping
    public ResponseEntity<List<Mois>> findAll(@RequestParam(required = false) Long anneeId) {
        if (anneeId != null) {
            return ResponseEntity.ok(moisService.findByAnnee(anneeId));
        }
        return ResponseEntity.ok(moisService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mois> findById(@PathVariable Long id) {
        return ResponseEntity.ok(moisService.findById(id));
    }

    /**
     * POST /api/mois?anneeId=1
     * Crée un mois rattaché à l'année spécifiée.
     */
    @PostMapping
    public ResponseEntity<Mois> create(@RequestParam Long anneeId, @RequestBody Mois mois) {
        return ResponseEntity.ok(moisService.create(mois, anneeId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mois> update(@PathVariable Long id, @RequestBody Mois mois) {
        return ResponseEntity.ok(moisService.update(id, mois));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moisService.delete(id);
        return ResponseEntity.noContent().build();
    }
}