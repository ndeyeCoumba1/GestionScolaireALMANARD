package com.example.GestionScolaire.Config;

import com.example.GestionScolaire.Model.User;
import com.example.GestionScolaire.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        System.out.println("=== LOGIN DEBUG ===");
        System.out.println("Email reçu : " + email);
        System.out.println("Password reçu : " + (password != null ? "OK (non null)" : "NULL !!"));

        Optional<User> userOpt = userRepository.findByEmail(email);
        System.out.println("User trouvé : " + userOpt.isPresent());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Email introuvable");
        }

        User user = userOpt.get();
        System.out.println("User actif : " + user.getActif());
        System.out.println("Role : " + user.getRole());
        System.out.println("Password hashé en BDD : " + user.getPassword());

        boolean passwordMatch;
        try {
            passwordMatch = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Password match : " + passwordMatch);
        } catch (Exception e) {
            System.out.println("ERREUR passwordEncoder : " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur encodage: " + e.getMessage());
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
            System.out.println("Token généré : OK");
        } catch (Exception e) {
            System.out.println("ERREUR generateToken : " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur token: " + e.getMessage());
        }

        try {
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", user.getRole().name(),
                    "nom", user.getNom(),
                    "prenom", user.getPrenom(),
                    "nomArabe",     user.getNomArabe()    != null ? user.getNomArabe()    : "",
                    "prenomArabe",  user.getPrenomArabe() != null ? user.getPrenomArabe() : ""

            ));
        } catch (Exception e) {
            System.out.println("ERREUR réponse finale : " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur réponse: " + e.getMessage());
        }
    }
}