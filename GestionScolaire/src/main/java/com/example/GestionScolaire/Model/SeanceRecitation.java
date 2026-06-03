package com.example.GestionScolaire.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "seance_recitation", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_seance_date_classe",
                columnNames = {"date", "classe_id"}
        )
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeanceRecitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Date de la séance */
    @Column(nullable = false)
    private LocalDate date;

    /** Classe concernée */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classe_id", nullable = false)
    private Classe classe;

    /** Enseignant qui a animé la séance */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private User enseignant;

    /** Utilisateur qui a enregistré la séance (peut être comptable/admin) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enregistre_par_id")
    private User enregistrePar;

    /** Récitations individuelles des élèves */
    @OneToMany(mappedBy = "seance", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EleveRecitation> recitations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
