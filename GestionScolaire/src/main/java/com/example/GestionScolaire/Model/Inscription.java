package com.example.GestionScolaire.Model;


import com.example.GestionScolaire.Enum.StatutPaiement;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name="inscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateInscription;


    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private StatutPaiement statutPaiement = StatutPaiement.IMPAYE;

    @Column(nullable = false)
    private Double fraisInscription;

    @ManyToOne
    @JoinColumn(name = "annee_id")
    private Annee annee;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @ManyToOne
    @JoinColumn(name = "mois_id")
    private Mois mois;

    @ManyToOne
    @JoinColumn(name = "eleve_id")
    private Eleve eleve;


}
