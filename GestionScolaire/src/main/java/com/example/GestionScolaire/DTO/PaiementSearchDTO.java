package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

public class PaiementSearchDTO {

    /** Une ligne d'élève impayé pour un mois donné */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EleveImpayeDTO {
        private Long eleveId;
        private String nom;
        private String prenom;
        private String matricule;
        private String classeNom;
        private Double montantAttendu;
    }

    /** Situation de paiement d'un élève pour un mois */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SituationMensuelleDTO {
        private Long moisId;
        private String moisLibelle;
        private Double montantAttendu;
        private Double montantPaye;
        private Double resteAPayer;
        private StatutPaiement statut;
        private String numeroRecu;
        private LocalDate datePaiement;
        private TypePaiement typePaiement;
    }

    /** Vue annuelle consolidée d'un élève : frais d'inscription + toutes les mensualités */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SituationAnnuelleEleveDTO {
        private Long eleveId;
        private String eleveNom;
        private String elevePrenom;
        private String matricule;
        private Double totalAttendu;
        private Double totalPaye;
        private Double totalRestant;
        private List<SituationMensuelleDTO> mois;
    }

    /** Taux de recouvrement d'un mois : élèves ayant payé vs total inscrits */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TauxRecouvrementDTO {
        private Long moisId;
        private String moisLibelle;
        private int totalEleves;
        private int elevesPayes;
        private int elevesImpaye;
        private Double montantAttendu;
        private Double montantRecu;
        private int tauxRecouvrement;  // %
    }
}