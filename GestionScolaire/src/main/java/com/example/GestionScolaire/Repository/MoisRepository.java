package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.Mois;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.Optional;

@Repository
public interface MoisRepository extends JpaRepository<Mois, Long> {

    Optional<Mois> findByLibelle(String libelle);

    boolean existsByLibelle(String libelle);
}
