package com.example.GestionScolaire.Repository;


import com.example.GestionScolaire.Model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent,Long> {
    Optional<Parent> findByEmail(String email);
    Optional<Parent> findByTelephone(String telephone);

    boolean existsByEmail(String email);

    boolean existsByTelephone(String telephone);

    // Recherche globale
    @Query("SELECT p FROM Parent p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "p.telephone LIKE CONCAT('%', :query, '%')")
    List<Parent> searchGlobal(@Param("query") String query);

}
