package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Model.Mois;
import com.example.GestionScolaire.Model.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {


    List<Paiement> findByEleveId(Long eleveId);
    List<Paiement> findByStatut(StatutPaiement statut);

    Optional<Paiement> findByNumeroRecu(String numeroRecu);

    List<Paiement> findByEleveAndAnnee(Eleve eleve, Annee annee);


    List<Paiement> findByEleveAndStatut(Eleve eleve, StatutPaiement statut);

    boolean existsByEleveAndMoisAndStatut(Eleve eleve, Mois mois, StatutPaiement statut);

    List<Paiement> findByDatePaiementBetween(LocalDate debut, LocalDate fin);


    @Query("SELECT SUM(p.montant) FROM Paiement p WHERE " +
            "p.statut = :statut AND p.datePaiement BETWEEN :debut AND :fin")
    Double sumMontantByPeriode(@Param("statut") StatutPaiement statut,
                               @Param("debut") LocalDate debut,
                               @Param("fin") LocalDate fin);

    @Query("SELECT SUM(p.montant) FROM Paiement p WHERE " +
            "p.statut = :statut AND p.annee = :annee")
    Double sumMontantByAnnee(@Param("statut") StatutPaiement statut,
                             @Param("annee") Annee annee);

    @Query("SELECT p FROM Paiement p WHERE p.statut = :statut " +
            "ORDER BY p.datePaiement ASC")
    List<Paiement> findAllByStatutOrderByDate(@Param("statut") StatutPaiement statut);

    @Query("SELECT p.mois.libelle, SUM(p.montant) FROM Paiement p " +
            "WHERE p.annee = :annee AND p.statut = :statut " +
            "GROUP BY p.mois.libelle")
    List<Object[]> statsParMois(@Param("annee") Annee annee,
                                @Param("statut") StatutPaiement statut);
}