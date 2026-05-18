package com.example.GestionScolaire.Model;


import com.example.GestionScolaire.Enum.TypeDepense;
import jakarta.persistence.*;

import lombok.*;
;import java.time.LocalDate;

@Entity
@Table(name="depenses")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Depense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private TypeDepense typeDepense;

    @Column(nullable = false)
    private Double montant;

    @Column(nullable = false)
    private LocalDate dateDepense;

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
