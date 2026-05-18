package com.example.GestionScolaire.Repository;


import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Model.Eleve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface EleveRepository extends JpaRepository<Eleve, Long> {

    // Recherche par nom ou prénom (insensible à la casse)
    List<Eleve> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom
    );

    List<Eleve> findByClasseId(Long classeId);
    List<Eleve> findByParentId(Long parentId);

    // Élèves par statut
    List<Eleve> findByStatut(StatutEleve statut);

    // Élèves d'une classe par statut
    List<Eleve> findByClasseAndStatut(Classe classe, StatutEleve statut);

    // Recherche globale (nom, prénom, classe)
    @Query("SELECT e FROM Eleve e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.classe.niveau) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Eleve> searchGlobal(@Param("query") String query);

    // Compter les élèves inscrits
    long countByStatut(StatutEleve statut);
}
