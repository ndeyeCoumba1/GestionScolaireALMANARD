package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PaiementDTO {
    private Long id;
    private String numeroRecu;
    private Double montant;
    private LocalDate datePaiement;
    private MotifPaiement motif;
    private StatutPaiement statut;
    private TypePaiement typePaiement;
    private String eleveNom;
    private String elevePrenom;
    private String moisLibelle;
    private String anneeLibelle;
    private String enregistreParNom;
}
