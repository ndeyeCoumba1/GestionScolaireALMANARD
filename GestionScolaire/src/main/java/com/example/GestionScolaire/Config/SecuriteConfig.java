package com.example.GestionScolaire.Config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecuriteConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Bean CORS séparé et correctement configuré
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // URL de votre frontend React
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ référence le bean
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/coran/**").hasAnyRole("ADMIN", "ENSEIGNANT", "RECITATEUR")
                        .requestMatchers("/api/inscriptions/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .requestMatchers("/api/rapports/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .requestMatchers("/api/eleves/**").hasAnyRole("ADMIN", "COMPTABLE", "ENSEIGNANT", "RECITATEUR")
                        .requestMatchers("/api/parents/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .requestMatchers("/api/classes/**").authenticated()
                        .requestMatchers("/api/mois/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .requestMatchers("/api/annees/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .requestMatchers("/api/depenses/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .requestMatchers("/api/etablissement/**").hasAnyRole("ADMIN")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/paiements/**").hasAnyRole("ADMIN", "COMPTABLE")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}