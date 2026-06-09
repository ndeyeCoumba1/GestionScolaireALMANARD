package com.example.GestionScolaire.Model;

import com.example.GestionScolaire.Enum.NiveauMemorisation;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "eleve_recitation", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_eleve_recitation_seance_eleve",
                columnNames = {"seance_id", "eleve_id"}
        )
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EleveRecitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seance_id", nullable = false)
    private SeanceRecitation seance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    /** Verset de début récité par l'élève */
    @Column(name = "verset_debut")
    private Integer versetDebut;

    /** Verset de fin récité par l'élève */
    @Column(name = "verset_fin")
    private Integer versetFin;

    /** Numéro de la sourate */
    @Column(name = "sourate_numero")
    private Integer sourateNumero;

    /** Nom de la sourate */
    @Column(name = "sourate_nom", length = 100)
    private String sourateNom;

    /** Nom arabe de la sourate */
    @Column(name = "sourate_nom_arabe", length = 100)
    private String sourateNomArabe;

    @Column(nullable = false)
    private boolean present;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_memorisation", nullable = false, length = 20)
    private NiveauMemorisation niveauMemorisation;

    @Column(length = 500)
    private String commentaire;

    /** Révision sur laquelle s'appuie cette récitation */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seance_revision_id")
    private SeanceRevision seanceRevision;
}