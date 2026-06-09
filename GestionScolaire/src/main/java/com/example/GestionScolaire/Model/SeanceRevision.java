package com.example.GestionScolaire.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "seance_revision")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeanceRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    /** Numéro de la séance dans la journée (1 = matin, 2 = après-midi, etc.) */
    @Column(name = "numero_seance", nullable = false)
    @Builder.Default
    private Integer numeroSeance = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classe_id", nullable = false)
    private Classe classe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private User enseignant;

    @Column(name = "sourate_numero")
    private Integer sourateNumero;

    @Column(name = "sourate_nom", length = 100)
    private String sourateNom;

    @Column(name = "sourate_nom_arabe", length = 100)
    private String sourateNomArabe;

    @Column(name = "verset_revision_debut", nullable = false)
    private Integer versetRevisionDebut;

    @Column(name = "verset_revision_fin", nullable = false)
    private Integer versetRevisionFin;

    @Column(length = 500)
    private String commentaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enregistre_par_id")
    private User enregistrePar;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}