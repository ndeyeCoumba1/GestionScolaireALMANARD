package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.Model.Parent;
import com.example.GestionScolaire.Service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parents")
public class ParentController {

    private final ParentService parentService;

    @GetMapping
    public ResponseEntity<List<Parent>> findAll() {
        return ResponseEntity.ok(parentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parent> findById(@PathVariable Long id) {
        return ResponseEntity.ok(parentService.findById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Parent>> search(@RequestParam String query) {
        return ResponseEntity.ok(parentService.search(query));
    }
    @PostMapping
    public ResponseEntity<Parent> create(@RequestBody Parent parent) {
        return ResponseEntity.ok(parentService.create(parent));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parent> update(@PathVariable Long id,
                                         @RequestBody Parent parent) {
        return ResponseEntity.ok(parentService.update(id, parent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        parentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
