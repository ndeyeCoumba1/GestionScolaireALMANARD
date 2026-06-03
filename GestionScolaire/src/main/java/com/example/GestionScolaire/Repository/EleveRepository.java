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

    List<Eleve> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom
    );

    List<Eleve> findByClasseId(Long classeId);
    List<Eleve> findByParentId(Long parentId);
    List<Eleve> findByStatut(StatutEleve statut);
    List<Eleve> findByClasseAndStatut(Classe classe, StatutEleve statut);

    @Query("SELECT e FROM Eleve e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.classe.niveau) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.matricule) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Eleve> searchGlobal(@Param("query") String query);

    long countByStatut(StatutEleve statut);
    // ✅ Vérifier si un matricule existe déjà
    boolean existsByMatricule(String matricule);

    // ✅ Trouver un élève par son matricule
    Optional<Eleve> findByMatricule(String matricule);

    // ✅ Compter le nombre total d'élèves
    long count();

    // ✅ Charge l'élève avec sa classe et son parent en une seule requête
    @Query("""
        SELECT e FROM Eleve e
        LEFT JOIN FETCH e.classe c
        LEFT JOIN FETCH c.enseignant
        LEFT JOIN FETCH e.parent
        WHERE e.id = :id
    """)
    Optional<Eleve> findByIdWithDetails(@Param("id") Long id);
}