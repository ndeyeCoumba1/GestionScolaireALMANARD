package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Enum.Sexe;
import com.example.GestionScolaire.Enum.StatutEleve;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EleveDTO {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String nomArabe;
    private String prenomArabe;
    private LocalDate dateNaissance;
    private Sexe sexe;
    private String adresse;
    private String photoUrl;
    private StatutEleve statut;

    // Classe
    private Long classeId;
    private NiveauClasse classeRegime;   // INTERNAT / EXTERNAT / DEMI_PENSION
    private StatutEleve classeStatut;
    private Integer classeCapaciteMax;

    // Enseignant de la classe
    private Long enseignantId;
    private String enseignantNom;
    private String enseignantPrenom;

    // Parent
    private Long parentId;
    private String parentNom;
    private String parentPrenom;
    private String parentTelephone;
    private String parentEmail;
    private String parentAdresse;
    private String parentProfession;
}