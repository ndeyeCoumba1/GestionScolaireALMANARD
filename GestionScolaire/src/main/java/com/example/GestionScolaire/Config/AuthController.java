package com.example.GestionScolaire.Config;

import com.example.GestionScolaire.Model.User;
import com.example.GestionScolaire.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * GET /api/auth/me
     * Retourne les informations de l'utilisateur connecté (accessible à tous les rôles)
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Non authentifié");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id",           user.getId(),
                        "nom",          user.getNom(),
                        "prenom",       user.getPrenom(),
                        "nomArabe",     user.getNomArabe()    != null ? user.getNomArabe()    : "",
                        "prenomArabe",  user.getPrenomArabe() != null ? user.getPrenomArabe() : "",
                        "email",        user.getEmail(),
                        "role",         user.getRole().name()
                )))
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("Tentative de connexion avec un email inconnu");
            return ResponseEntity.status(401).body("Email introuvable");
        }

        User user = userOpt.get();

        boolean passwordMatch;
        try {
            passwordMatch = passwordEncoder.matches(password, user.getPassword());
        } catch (Exception e) {
            log.error("Erreur lors de la vérification du mot de passe", e);
            return ResponseEntity.status(500).body("Erreur interne");
        }

        if (!passwordMatch) {
            return ResponseEntity.status(401).body("Mot de passe incorrect");
        }

        if (!user.getActif()) {
            return ResponseEntity.status(403).body("Compte désactivé");
        }

        String token;
        try {
            token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        } catch (Exception e) {
            log.error("Erreur lors de la génération du token JWT", e);
            return ResponseEntity.status(500).body("Erreur interne");
        }

        return ResponseEntity.ok(Map.of(
                "token",        token,
                "id",           user.getId(),
                "role",         user.getRole().name(),
                "nom",          user.getNom(),
                "prenom",       user.getPrenom(),
                "email",        user.getEmail(),
                "nomArabe",     user.getNomArabe()    != null ? user.getNomArabe()    : "",
                "prenomArabe",  user.getPrenomArabe() != null ? user.getPrenomArabe() : ""
        ));
    }
}