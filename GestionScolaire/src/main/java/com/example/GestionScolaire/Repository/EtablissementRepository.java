package com.example.GestionScolaire.Repository;


import com.example.GestionScolaire.Model.Etablissement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.Optional;

@Repository
public interface EtablissementRepository extends JpaRepository<Etablissement,Long> {

    Optional<Etablissement> findByNom(String nom);

    boolean existsByTelephone(String telephone);

    boolean existsByEmail(String email);
}
