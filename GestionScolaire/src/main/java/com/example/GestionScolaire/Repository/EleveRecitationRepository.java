package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Enum.NiveauMemorisation;
import com.example.GestionScolaire.Model.EleveRecitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.*;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EleveRecitationRepository extends JpaRepository<EleveRecitation, Long> {
    List<EleveRecitation> findBySeanceId(Long seanceId);

    List<EleveRecitation> findByEleveId(Long eleveId);

    @Query("""
        SELECT r FROM EleveRecitation r
        WHERE r.eleve.id = :eleveId
        AND r.seance.date >= :dateDebut
        AND r.seance.date <= :dateFin
        ORDER BY r.seance.date DESC
    """)
    List<EleveRecitation> findByEleveIdAndDateRange(
            @Param("eleveId")   Long eleveId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin")   LocalDate dateFin
    );
    List<EleveRecitation> findBySeanceClasseId(Long classeId);

    @Query("""
        SELECT r FROM EleveRecitation r
        WHERE r.seance.classe.id = :classeId
        AND r.seance.date >= :dateDebut
        AND r.seance.date <= :dateFin
        ORDER BY r.eleve.nom, r.seance.date
    """)
    List<EleveRecitation> findByClasseIdAndDateRange(
            @Param("classeId")  Long classeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin")   LocalDate dateFin
    );

    // Stats rapides par élève
    @Query("""
        SELECT COUNT(r) FROM EleveRecitation r
        WHERE r.eleve.id = :eleveId AND r.present = true
    """)
    long countPresencesByEleveId(@Param("eleveId") Long eleveId);

    @Query("""
        SELECT COUNT(r) FROM EleveRecitation r
        WHERE r.eleve.id = :eleveId
        AND r.present = true
        AND r.niveauMemorisation = :niveau
    """)
    long countByEleveIdAndNiveau(
            @Param("eleveId") Long eleveId,
            @Param("niveau") NiveauMemorisation niveau
    );

    Optional<EleveRecitation> findBySeanceIdAndEleveId(Long seanceId, Long eleveId);
}
