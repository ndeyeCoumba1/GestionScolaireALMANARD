package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Model.Inscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    // Vérifier si un élève est déjà inscrit pour une année donnée
    boolean existsByEleveAndAnnee(Eleve eleve, Annee annee);

    // Trouver l'inscription d'un élève pour une année
    Optional<Inscription> findByEleveAndAnnee(Eleve eleve, Annee annee);

    // Toutes les inscriptions d'une année
    List<Inscription> findByAnnee(Annee annee);

    // Toutes les inscriptions d'une classe pour une année
    List<Inscription> findByClasseAndAnnee(Classe classe, Annee annee);

    // Toutes les inscriptions d'un élève (historique)
    List<Inscription> findByEleve(Eleve eleve);

    // Compter les inscriptions par année
    long countByAnnee(Annee annee);

    // Compter les inscriptions par classe et année
    long countByClasseAndAnnee(Classe classe, Annee annee);

    // Revenus d'inscription par année
    @Query("SELECT SUM(i.fraisInscription) FROM Inscription i WHERE i.annee = :annee")
    Double sumFraisInscriptionByAnnee(@Param("annee") Annee annee);
}
