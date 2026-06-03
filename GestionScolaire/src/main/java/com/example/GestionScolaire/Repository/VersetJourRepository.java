package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.VersetJour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VersetJourRepository extends JpaRepository<VersetJour, Long> {
    List<VersetJour> findByDateAndClasseId(LocalDate date, Long classeId);

    List<VersetJour> findByClasseIdOrderByDateDesc(Long classeId);

    Optional<VersetJour> findByDateAndClasseIdAndGroupeNiveau(
            LocalDate date, Long classeId, String groupeNiveau
    );
}
