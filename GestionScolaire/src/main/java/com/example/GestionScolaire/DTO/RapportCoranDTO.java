package com.example.GestionScolaire.DTO;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

public class RapportCoranDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RapportResponse {
        private Long classeId;
        private String classeNom;
        private String enseignantClasse;
        private LocalDate dateDebut;
        private LocalDate dateFin;

        // Totaux globaux
        private int totalSeances;
        private int totalPresents;
        private int totalAbsents;
        private int totalMemorises;
        private int totalPartiels;
        private int tauxPresenceMoyen;    // %
        private int tauxMemorisationMoyen; // %

        // Une ligne par élève
        private List<LigneEleve> eleves;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneEleve {
        // Identité
        private Long eleveId;
        private String nom;
        private String prenom;
        private String nomArabe;
        private String prenomArabe;
        private String matricule;

        // Présence
        private int totalSeances;
        private int presents;
        private int absents;
        private int tauxPresence;  // %

        // Mémorisation
        private int memorises;
        private int partiels;
        private int tauxMemorisation;  // %
        private String niveau;         // ممتاز / جيد / متوسط / ضعيف

        // Récitation (تلاوة)
        private String sourateNomArabe;
        private String sourateNom;
        private Integer versetTlatwaDebut;
        private Integer versetTlatwaFin;

        // Révision (مراجعة)
        private Integer versetRevisionDebut;
        private Integer versetRevisionFin;

        // المسمع (enseignant qui a animé la séance de récitation)
        private String enseignantNom;

        // Observations
        private String commentaire;
    }
}