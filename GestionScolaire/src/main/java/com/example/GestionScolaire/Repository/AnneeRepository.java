package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.Annee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnneeRepository extends JpaRepository<Annee,Long> {

    @Query("SELECT a FROM Annee a WHERE a.actif = true")
    Optional<Annee> findAnneeActive();
    boolean existsByLibelle(String libelle);

    Optional<Annee> findByLibelle(String libelle);



}
