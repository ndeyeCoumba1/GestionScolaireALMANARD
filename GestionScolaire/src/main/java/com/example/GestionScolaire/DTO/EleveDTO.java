package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.Sexe;
import com.example.GestionScolaire.Enum.StatutEleve;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EleveDTO {
    private Long id;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private Sexe sexe;
    private String adresse;
    private StatutEleve statut;
    private Long classeId;
    private String classeNiveau;
    private Long parentId;
    private String parentNom;
    private String parentTelephone;
}
