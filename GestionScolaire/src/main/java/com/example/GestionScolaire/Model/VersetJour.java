package com.example.GestionScolaire.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "verset_jour", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_verset_jour_date_classe_groupe",
                columnNames = {"date", "classe_id", "groupe_niveau"}
        )
})
@Getter @Setter @NoArgsConstructor
@AllArgsConstructor @Builder
public class VersetJour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Date de la séance */
    @Column(nullable = false)
    private LocalDate date;

    /** Numéro de la sourate (1–114) */
    @Column(name = "sourate_numero", nullable = false)
    private Integer sourateNumero;

    /** Nom français de la sourate */
    @Column(name = "sourate_nom", nullable = false, length = 100)
    private String sourateNom;

    /** Nom arabe de la sourate */
    @Column(name = "sourate_nom_arabe", nullable = false, length = 100)
    private String sourateNomArabe;

    /** Verset de début */
    @Column(name = "verset_debut", nullable = false)
    private Integer versetDebut;

    /** Verset de fin */
    @Column(name = "verset_fin", nullable = false)
    private Integer versetFin;

    /** Groupe / niveau dans la classe (ex: "Débutant", "Intermédiaire", "Avancé") */
    @Column(name = "groupe_niveau", nullable = false, length = 50)
    private String groupeNiveau;

    /** Classe concernée */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classe_id", nullable = false)
    private Classe classe;

    /** Enseignant qui a assigné ce verset */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private User enseignant;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seance_id")
    private SeanceRecitation seance;
}
