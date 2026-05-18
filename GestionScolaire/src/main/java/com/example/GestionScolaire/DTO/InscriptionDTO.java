package com.example.GestionScolaire.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InscriptionDTO {
    private Long id;
    private LocalDate dateInscription;
    private Double fraisInscription;
    private String eleveNom;
    private String elevePrenom;
    private String anneeLibelle;
    private String classeNiveau;
}
