package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.SeanceRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SeanceRevisionRepository extends JpaRepository<SeanceRevision, Long> {

    List<SeanceRevision> findByEleveIdOrderByDateDesc(Long eleveId);

    List<SeanceRevision> findByClasseIdOrderByDateDesc(Long classeId);

    List<SeanceRevision> findByEnseignantIdOrderByDateDesc(Long enseignantId);

    @Query("SELECT r FROM SeanceRevision r WHERE r.classe.id = :classeId AND r.date BETWEEN :debut AND :fin ORDER BY r.date DESC")
    List<SeanceRevision> findByClasseIdAndDateBetween(
            @Param("classeId") Long classeId,
            @Param("debut") LocalDate debut,
            @Param("fin") LocalDate fin);

    @Query("SELECT r FROM SeanceRevision r WHERE r.eleve.id = :eleveId AND r.date BETWEEN :debut AND :fin ORDER BY r.date DESC")
    List<SeanceRevision> findByEleveIdAndDateBetween(
            @Param("eleveId") Long eleveId,
            @Param("debut") LocalDate debut,
            @Param("fin") LocalDate fin);

    /**
     * Trouve les révisions d'un élève qui couvrent un verset donné (pour une date <= dateSeance).
     * La révision couvre la plage si versetRevisionDebut <= versetDebut ET versetRevisionFin >= versetFin.
     */
    @Query("SELECT r FROM SeanceRevision r WHERE r.eleve.id = :eleveId " +
           "AND r.sourateNumero = :sourateNumero " +
           "AND r.versetRevisionDebut <= :versetDebut " +
           "AND r.versetRevisionFin >= :versetFin " +
           "AND r.date <= :dateSeance " +
           "ORDER BY r.date DESC")
    List<SeanceRevision> findRevisionsPourVerset(
            @Param("eleveId") Long eleveId,
            @Param("sourateNumero") Integer sourateNumero,
            @Param("versetDebut") Integer versetDebut,
            @Param("versetFin") Integer versetFin,
            @Param("dateSeance") LocalDate dateSeance);
}