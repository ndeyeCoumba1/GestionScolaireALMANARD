package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Enum.NiveauMemorisation;
import lombok.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;


import java.time.*;

public class CoranDTO {

    // ── VersetJour ───────────────────────────────

    @Data
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VersetJourRequest {
        @NotNull(message = "La date est obligatoire")
        private LocalDate date;

        @NotNull
        @Min(1)
        @Max(114)
        private Integer sourateNumero;

        @NotBlank
        private String sourateNom;

        @NotBlank
        private String sourateNomArabe;

        @NotNull @Min(1)
        private Integer versetDebut;

        @NotNull @Min(1)
        private Integer versetFin;

        @NotBlank
        private String groupeNiveau;

        @NotNull
        private Long classeId;

        @NotNull
        private Long enseignantId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VersetJourResponse {
        private Long id;
        private LocalDate date;
        private Integer sourateNumero;
        private String sourateNom;
        private String sourateNomArabe;
        private Integer versetDebut;
        private Integer versetFin;
        private String groupeNiveau;
        private Long classeId;
        private NiveauClasse classeNiveau;
        private Long enseignantId;
        private String enseignantNom;
        private LocalDateTime createdAt;
    }

    // ── SeanceRecitation ────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeanceRequest {
        @NotNull
        private LocalDate date;

        /** Numéro de la séance dans la journée (1 par défaut). */
        private Integer numeroSeance;

        @NotNull
        private Long classeId;

        @NotNull
        private Long enseignantId;

        @Valid
        private List<VersetJourRequest> versets;

        @Valid
        @NotEmpty(message = "La liste des récitations ne peut pas être vide")
        private List<EleveRecitationRequest> recitations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeanceResponse {
        private Long id;
        private LocalDate date;
        private Integer numeroSeance;
        private Long classeId;
        private NiveauClasse classeNiveau;
        private Long enseignantId;
        private String enseignantNom;
        private List<VersetJourResponse> versets;
        private List<EleveRecitationResponse> recitations;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ── EleveRecitation ─────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EleveRecitationRequest {
        @NotNull
        private Long eleveId;

        @NotBlank
        private String groupeNiveau;

        private Long versetJourId;

        @NotNull
        private Boolean present;

        @NotNull
        private NiveauMemorisation niveauMemorisation;

        private String commentaire;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EleveRecitationResponse {
        private Long id;
        private Long seanceId;
        private Long eleveId;
        private String eleveNom;
        private String elevePrenom;
        private String matricule;
        private String groupeNiveau;
        private Long versetJourId;
        private String sourateNom;
        private String sourateNomArabe;
        private Integer versetDebut;
        private Integer versetFin;
        private boolean present;
        private NiveauMemorisation niveauMemorisation;
        private String commentaire;
    }

    // ── Statistiques ────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatistiquesEleveResponse {
        private Long eleveId;
        private String eleveNom;
        private String elevePrenom;
        private String matricule;
        private String groupeNiveau;
        private long totalSeances;
        private long nombrePresent;
        private long nombreMemorise;
        private long nombrePartiel;
        private long nombreNonMemorise;
        private double tauxPresence;      // %
        private double tauxMemorisation;  // % parmi présents
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StatistiquesClasseResponse {
        private Long classeId;
        private NiveauClasse classeNiveau;
        private long totalSeances;
        private double tauxPresenceMoyen;
        private double tauxMemorisationMoyen;
        private List<StatistiquesEleveResponse> eleves;
    }
}
