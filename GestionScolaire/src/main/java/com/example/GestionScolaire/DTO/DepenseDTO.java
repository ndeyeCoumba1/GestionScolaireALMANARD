package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.TypeDepense;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DepenseDTO {
    private Long id;
    private String description;
    private TypeDepense typeDepense;
    private Double montant;
    private LocalDate dateDepense;
    private String anneeLibelle;
    private String moisLibelle;
    private String enregistreParNom;
}
