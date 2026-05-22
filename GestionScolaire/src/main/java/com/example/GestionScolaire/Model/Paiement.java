package com.example.GestionScolaire.Model;

import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name="paiements")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Paiement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double montant;
    private String numeroRecu;
    private LocalDate datePaiement;

    @Enumerated(EnumType.STRING)
    private MotifPaiement motif;       // Inscription, Mensualité

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private StatutPaiement statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_paiement")
    private TypePaiement typePaiement;

    @ManyToOne
    @JoinColumn(name = "eleve_id")
    private Eleve eleve;

    @ManyToOne
    @JoinColumn(name = "annee_id")
    private Annee annee;

    @ManyToOne
    @JoinColumn(name = "mois_id")
    private Mois mois;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User enregistrePar;
}
