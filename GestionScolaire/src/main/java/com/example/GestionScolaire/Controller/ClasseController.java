package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Service.ClasseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClasseController {
    private final ClasseService classeService;

    @GetMapping
    public ResponseEntity<List<Classe>> findAll() {
        return ResponseEntity.ok(classeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classe> findById(@PathVariable Long id) {
        return ResponseEntity.ok(classeService.findById(id));
    }

    @GetMapping("/niveau/{niveau}")
    public ResponseEntity<List<Classe>> findByNiveau(@PathVariable NiveauClasse niveau) {
        return ResponseEntity.ok(classeService.findByNiveau(niveau));
    }
    @GetMapping("/disponibles")
    public ResponseEntity<List<Classe>> findDisponibles() {
        return ResponseEntity.ok(classeService.findClassesDisponibles());
    }

    @GetMapping("/{id}/count-eleves")
    public ResponseEntity<Long> countEleves(@PathVariable Long id) {
        return ResponseEntity.ok(classeService.countEleves(id));
    }

    @PostMapping
    public ResponseEntity<Classe> create(@RequestBody Classe classe) {
        return ResponseEntity.ok(classeService.create(classe));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Classe> update(@PathVariable Long id,
                                         @RequestBody Classe classe) {
        return ResponseEntity.ok(classeService.update(id, classe));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
