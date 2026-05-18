package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClasseRepository extends JpaRepository<Classe,Long> {



    // Lister les classes par niveau
    List<Classe> findByNiveau(NiveauClasse niveau);

    // Trouve les classes d'un enseignant
    List<Classe> findByEnseignant(User enseignant);

    // Nombre d'élèves dans une classe
    @Query("SELECT COUNT(e) FROM Eleve e WHERE e.classe.id = :classeId")
    long countElevesInClasse(Long classeId);

    // Classes ayant encore de la capacité disponible
    @Query("SELECT c FROM Classe c WHERE " +
            "(SELECT COUNT(e) FROM Eleve e WHERE e.classe = c) < c.capaciteMax")
    List<Classe> findClassesDisponibles();

}
