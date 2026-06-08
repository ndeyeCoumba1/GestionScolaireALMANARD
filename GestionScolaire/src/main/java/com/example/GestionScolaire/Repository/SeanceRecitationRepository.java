package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.SeanceRecitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeanceRecitationRepository extends JpaRepository<SeanceRecitation, Long> {

    List<SeanceRecitation> findByDateAndClasseIdOrderByNumeroSeanceAsc(LocalDate date, Long classeId);

    Optional<SeanceRecitation> findByDateAndClasseIdAndNumeroSeance(LocalDate date, Long classeId, Integer numeroSeance);

    List<SeanceRecitation> findByClasseIdAndDateBetweenOrderByDateDesc(
            Long classeId, LocalDate dateDebut, LocalDate dateFin
    );

    List<SeanceRecitation> findByClasseIdOrderByDateDesc(Long classeId);

    @Query("SELECT COUNT(DISTINCT s.date) FROM SeanceRecitation s WHERE s.classe.id = :classeId")
    long countSeancesParClasse(@Param("classeId") Long classeId);

    @Query("""
        SELECT COUNT(DISTINCT s.date)
        FROM SeanceRecitation s
        WHERE s.classe.id = :classeId
        AND s.date >= :dateDebut
        AND s.date <= :dateFin
    """)
    long countSeancesParClasseAndDateRange(
            @Param("classeId")  Long classeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin")   LocalDate dateFin
    );
}