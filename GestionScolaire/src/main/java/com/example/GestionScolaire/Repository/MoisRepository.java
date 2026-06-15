package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Mois;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoisRepository extends JpaRepository<Mois, Long> {

    List<Mois> findByAnnee(Annee annee);

    List<Mois> findByAnneeId(Long anneeId);

    Optional<Mois> findByLibelle(String libelle);

    Optional<Mois> findByLibelleAndAnnee(String libelle, Annee annee);

    boolean existsByLibelleAndAnnee(String libelle, Annee annee);
}