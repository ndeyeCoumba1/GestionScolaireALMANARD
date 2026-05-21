package com.example.GestionScolaire.Controller;


import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Service.AnneeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/annees")
@CrossOrigin(origins = "*")
public class AnneeController {
    private final AnneeService anneeService;

    @GetMapping
    public ResponseEntity<List<Annee>> findAll() {
        return ResponseEntity.ok(anneeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Annee> findById(@PathVariable Long id) {
        return ResponseEntity.ok(anneeService.findById(id));
    }

    @GetMapping("/active")
    public ResponseEntity<Annee> findAnneeActive() {
        return ResponseEntity.ok(anneeService.findAnneeActive());
    }
    @PostMapping
    public ResponseEntity<Annee> create(@RequestBody Annee annee) {
        return ResponseEntity.ok(anneeService.create(annee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Annee> update(@PathVariable Long id,
                                        @RequestBody Annee annee) {
        return ResponseEntity.ok(anneeService.update(id, annee));
    }

    @PutMapping("/{id}/activer")
    public ResponseEntity<Annee> activer(@PathVariable Long id) {
        return ResponseEntity.ok(anneeService.activerAnnee(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        anneeService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
