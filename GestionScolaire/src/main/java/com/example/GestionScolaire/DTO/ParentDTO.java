package com.example.GestionScolaire.DTO;

import lombok.Data;

import java.util.List;

@Data
public class ParentDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String telephone;
    private String email;
    private String adresse;
    private String profession;
    private List<String> nomsEleves;
}
