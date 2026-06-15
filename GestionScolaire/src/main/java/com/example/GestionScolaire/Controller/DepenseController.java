
package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.Enum.TypeDepense;
import com.example.GestionScolaire.Model.Depense;
import com.example.GestionScolaire.Service.DepenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/depenses")
public class DepenseController {

    private final DepenseService depenseService;

    @GetMapping
    public ResponseEntity<List<Depense>> findAll() {
        return ResponseEntity.ok(depenseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Depense> findById(@PathVariable Long id) {
        return ResponseEntity.ok(depenseService.findById(id));
    }

    @GetMapping("/annee/{anneeId}")
    public ResponseEntity<List<Depense>> findByAnnee(@PathVariable Long anneeId) {
        return ResponseEntity.ok(depenseService.findByAnnee(anneeId));
    }

    @GetMapping("/mois/{moisId}")
    public ResponseEntity<List<Depense>> findByMois(@PathVariable Long moisId) {
        return ResponseEntity.ok(depenseService.findByMois(moisId));
    }

    @GetMapping("/annee/{anneeId}/mois/{moisId}")
    public ResponseEntity<List<Depense>> findByAnneeAndMois(@PathVariable Long anneeId,
                                                            @PathVariable Long moisId) {
        return ResponseEntity.ok(depenseService.findByAnneeAndMois(anneeId, moisId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Depense>> findByType(@PathVariable TypeDepense type) {
        return ResponseEntity.ok(depenseService.findByType(type));
    }

    @GetMapping("/periode")
    public ResponseEntity<List<Depense>> findByPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(depenseService.findByPeriode(debut, fin));
    }

    @GetMapping("/total/annee/{anneeId}")
    public ResponseEntity<Double> totalParAnnee(@PathVariable Long anneeId) {
        return ResponseEntity.ok(depenseService.totalParAnnee(anneeId));
    }

    @GetMapping("/total/mois/{moisId}")
    public ResponseEntity<Double> totalParMois(@PathVariable Long moisId) {
        return ResponseEntity.ok(depenseService.totalParMois(moisId));
    }

    @GetMapping("/total/annee/{anneeId}/mois/{moisId}")
    public ResponseEntity<Double> totalParMoisEtAnnee(@PathVariable Long anneeId,
                                                      @PathVariable Long moisId) {
        return ResponseEntity.ok(depenseService.totalParMoisEtAnnee(moisId, anneeId));
    }

    @GetMapping("/total/periode")
    public ResponseEntity<Double> totalParPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(depenseService.totalParPeriode(debut, fin));
    }

    @GetMapping("/stats/annee/{anneeId}")
    public ResponseEntity<List<Object[]>> statsParType(@PathVariable Long anneeId) {
        return ResponseEntity.ok(depenseService.statsParType(anneeId));
    }

    @GetMapping("/stats/mois/{moisId}")
    public ResponseEntity<List<Object[]>> statsParTypeEtMois(@PathVariable Long moisId) {
        return ResponseEntity.ok(depenseService.statsParTypeEtMois(moisId));
    }

    @PostMapping
    public ResponseEntity<Depense> create(@RequestBody Depense depense) {
        return ResponseEntity.ok(depenseService.create(depense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Depense> update(@PathVariable Long id,
                                          @RequestBody Depense depense) {
        return ResponseEntity.ok(depenseService.update(id, depense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        depenseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}