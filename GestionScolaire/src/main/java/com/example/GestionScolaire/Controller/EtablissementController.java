package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.Model.Etablissement;
import com.example.GestionScolaire.Service.EtablissementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/etablissements")
public class EtablissementController {
    private final EtablissementService etablissementService;

    @GetMapping
    public ResponseEntity<Etablissement> get() {
        return ResponseEntity.ok(etablissementService.findEtablissement());
    }

    @PostMapping
    public ResponseEntity<Etablissement> create(@RequestBody Etablissement etablissement) {
        return ResponseEntity.ok(etablissementService.create(etablissement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Etablissement> update(@PathVariable Long id,
                                                @RequestBody Etablissement etablissement) {
        return ResponseEntity.ok(etablissementService.update(id, etablissement));
    }
}
