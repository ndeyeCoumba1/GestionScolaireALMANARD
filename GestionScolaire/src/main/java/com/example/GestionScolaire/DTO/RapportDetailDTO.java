package com.example.GestionScolaire.DTO;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

public class RapportDetailDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RapportDetailResponse {
        private Long classeId;
        private String classeNom;
        private String enseignantClasse;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private int totalSeances;
        private List<LigneSeance> lignes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneSeance {
        // Séance
        private Long seanceId;
        private LocalDate date;
        private Integer numeroSeance;

        // Élève
        private Long eleveId;
        private String nom;
        private String prenom;
        private String nomArabe;
        private String prenomArabe;
        private String matricule;

        // Récitation
        private boolean present;
        private String sourateNomArabe;
        private String sourateNom;
        private Integer versetDebut;
        private Integer versetFin;
        private String niveauMemorisation; // MEMORISE / PARTIEL / NON_MEMORISE / null si absent

        // Révision (مراجعة) du même jour
        private String sourateRevisionNomArabe;
        private String sourateRevisionNom;
        private Integer versetRevisionDebut;
        private Integer versetRevisionFin;
        private String enseignantRevisionNom;

        // Encadrant récitation + observations
        private String enseignantNom;
        private String commentaire;
    }
}
