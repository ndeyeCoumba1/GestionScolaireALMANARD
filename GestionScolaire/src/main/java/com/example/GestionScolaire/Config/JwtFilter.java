package com.example.GestionScolaire.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("=== JWT FILTER ===");
        System.out.println("URI: " + request.getRequestURI());
        System.out.println("Auth Header: " + (authHeader != null ? "présent" : "absent"));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Pas de token Bearer, passage au filtre suivant");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        System.out.println("Token extrait: " + token.substring(0, Math.min(20, token.length())) + "...");

        try {
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);
                String role = jwtService.extractRole(token);

                System.out.println("Email extrait: " + email);
                System.out.println("Role extrait: " + role);

                if (email != null && role != null) {
                    // ✅ Créer l'autorité avec le rôle
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                    UserDetails userDetails = new User(email, "", Collections.singletonList(authority));

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("✅ Authentification établie avec rôle: ROLE_" + role);
                } else {
                    System.out.println("❌ Email ou rôle null");
                }
            } else {
                System.out.println("❌ Token invalide ou expiré");
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur JWT: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}