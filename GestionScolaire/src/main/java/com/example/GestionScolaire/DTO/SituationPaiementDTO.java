// DTO/SituationPaiementDTO.java
package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Enum.StatutPaiement;
import lombok.Data;
import java.util.List;

@Data
public class SituationPaiementDTO {
    private Double fraisInscriptionTotal;
    private Double fraisInscriptionPaye;
    private Double fraisInscriptionRestant;
    private StatutPaiement statutGlobal;
    private List<PaiementDTO> historique;
}