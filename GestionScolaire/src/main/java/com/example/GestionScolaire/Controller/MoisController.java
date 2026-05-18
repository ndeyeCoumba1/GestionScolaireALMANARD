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

    @GetMapping
    public ResponseEntity<List<Mois>> findAll() {
        return ResponseEntity.ok(moisService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mois> findById(@PathVariable Long id) {
        return ResponseEntity.ok(moisService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Mois> create(@RequestBody Mois mois) {
        return ResponseEntity.ok(moisService.create(mois));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Mois> update(@PathVariable Long id,
                                       @RequestBody Mois mois) {
        return ResponseEntity.ok(moisService.update(id, mois));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moisService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
