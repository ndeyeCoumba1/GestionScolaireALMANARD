package com.example.GestionScolaire.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Générer un token
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)                          // ← plus setSubject()
                .claim("role", role)
                .issuedAt(new Date())                    // ← plus setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + expiration)) // ← plus setExpiration()
                .signWith(getKey())                      // ← plus SignatureAlgorithm
                .compact();
    }

    // Extraire l'email du token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Extraire le rôle
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Vérifier si le token est valide
    public boolean isTokenValid(String token) {
        try {
            return getClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}