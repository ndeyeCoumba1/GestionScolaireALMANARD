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

    /** Séance parente */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seance_id", nullable = false)
    private SeanceRecitation seance;

    /** Élève concerné */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    /** Groupe / niveau de mémorisation de l'élève */
    @Column(name = "groupe_niveau", nullable = false, length = 50)
    private String groupeNiveau;

    /** Verset assigné à ce groupe ce jour-là */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verset_jour_id")
    private VersetJour versetJour;

    /** L'élève était-il présent ? */
    @Column(nullable = false)
    private boolean present;

    /** Niveau de mémorisation */
    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_memorisation", nullable = false, length = 20)
    private NiveauMemorisation niveauMemorisation;

    /** Commentaire libre de l'enseignant */
    @Column(length = 500)
    private String commentaire;

    /** Révision sur laquelle s'appuie cette récitation (traçabilité) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seance_revision_id")
    private SeanceRevision seanceRevision;

}
