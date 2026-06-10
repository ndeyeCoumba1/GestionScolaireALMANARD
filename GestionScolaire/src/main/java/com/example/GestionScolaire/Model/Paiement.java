package com.example.GestionScolaire.Model;

import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


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

    @ManyToOne
    @JoinColumn(name = "inscription_id")
    private Inscription inscription;


    private Double montantAttendu;

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

    /** Dernier utilisateur ayant modifié ou annulé ce paiement */
    @ManyToOne
    @JoinColumn(name = "modifie_par_id")
    private User modifiePar;

    /** Date de la dernière modification ou annulation */
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}
