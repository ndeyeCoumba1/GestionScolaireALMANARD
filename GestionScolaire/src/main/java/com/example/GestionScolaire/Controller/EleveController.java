package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.DTO.DtoMapper;
import com.example.GestionScolaire.DTO.EleveDTO;
import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Service.EleveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/eleves")
@CrossOrigin(origins = "*")
public class EleveController {

    private final EleveService eleveService;
    private final DtoMapper mapper;

    @GetMapping
    public ResponseEntity<List<EleveDTO>> findAll() {
        return ResponseEntity.ok(
                eleveService.findAll().stream()
                        .map(mapper::toEleveDTO)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EleveDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toEleveDTO(eleveService.findById(id)));
    }

    // ✅ Nouvel endpoint — toutes les informations de l'élève
    @GetMapping("/{id}/details")
    public ResponseEntity<EleveDTO> findByIdWithDetails(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toEleveDTO(eleveService.findByIdWithDetails(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Eleve>> search(@RequestParam String query) {
        return ResponseEntity.ok(eleveService.search(query));
    }

    @GetMapping("/classe/{classeId}")
    public ResponseEntity<List<Eleve>> findByClasse(@PathVariable Long classeId) {
        return ResponseEntity.ok(eleveService.findByClasse(classeId));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countByStatut(@RequestParam StatutEleve statut) {
        return ResponseEntity.ok(eleveService.countByStatut(statut));
    }

    @PostMapping
    public ResponseEntity<Eleve> create(@RequestBody Eleve eleve) {
        return ResponseEntity.ok(eleveService.create(eleve));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Eleve> update(@PathVariable Long id, @RequestBody Eleve eleve) {
        return ResponseEntity.ok(eleveService.update(id, eleve));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Void> changerStatut(@PathVariable Long id,
                                              @RequestParam StatutEleve statut) {
        eleveService.changerStatut(id, statut);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eleveService.delete(id);
        return ResponseEntity.noContent().build();
    }
}