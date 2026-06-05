package com.example.GestionScolaire.Controller;


import com.example.GestionScolaire.DTO.DtoMapper;
import com.example.GestionScolaire.DTO.UserDTO;
import com.example.GestionScolaire.Enum.Role;
import com.example.GestionScolaire.Model.User;
import com.example.GestionScolaire.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;
    private final DtoMapper mapper;

    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> findByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.findByRole(role));
    }

    /**
     * PATCH /api/users/{id}/nom-arabe
     * Met à jour uniquement les noms arabes d'un utilisateur.
     * Body : { "nomArabe": "...", "prenomArabe": "..." }
     */
    @PatchMapping("/{id}/nom-arabe")
    public ResponseEntity<UserDTO> updateNomArabe(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nomArabe    = body.get("nomArabe");
        String prenomArabe = body.get("prenomArabe");
        User updated = userService.updateNomArabe(id, nomArabe, prenomArabe);
        return ResponseEntity.ok(mapper.toUserDTO(updated));
    }
    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        return ResponseEntity.ok(userService.create(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id,
                                       @RequestBody User user) {
        return ResponseEntity.ok(userService.update(id, user));
    }

    @PutMapping("/{id}/desactiver")
    public ResponseEntity<Void> desactiver(@PathVariable Long id) {
        userService.desactiver(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/reactiver")
    public ResponseEntity<Void> reactiver(@PathVariable Long id) {
        userService.reactiver(id);
        return ResponseEntity.noContent().build();
    }
}
