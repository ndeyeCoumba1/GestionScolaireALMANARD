package com.example.GestionScolaire.Repository;

import com.example.GestionScolaire.Enum.TypeDepense;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Depense;
import com.example.GestionScolaire.Model.Mois;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DepenseRepository extends CrudRepository<Depense, Long> {
    // Dépenses par type
    List<Depense> findByTypeDepense(TypeDepense typeDepense);

    // Dépenses par année scolaire
    List<Depense> findByAnnee(Annee annee);

    List<Depense> findByMois(Mois mois);

    List<Depense> findByAnneeAndMois(Annee annee, Mois mois);

    // Dépenses entre deux dates
    List<Depense> findByDateDepenseBetween(LocalDate debut, LocalDate fin);

    // Total des dépenses par année
    @Query("SELECT SUM(d.montant) FROM Depense d WHERE d.annee = :annee")
    Double sumMontantByAnnee(@Param("annee") Annee annee);

    // Total des dépenses par mois
    @Query("SELECT SUM(d.montant) FROM Depense d WHERE d.mois = :mois")
    Double sumMontantByMois(@Param("mois") Mois mois);

    @Query("SELECT SUM(d.montant) FROM Depense d WHERE " +   // ✅ par mois ET année
            "d.mois = :mois AND d.annee = :annee")
    Double sumMontantByMoisAndAnnee(@Param("mois") Mois mois,
                                    @Param("annee") Annee annee);

    // Total des dépenses par type et année
    @Query("SELECT SUM(d.montant) FROM Depense d WHERE " +
            "d.typeDepense = :type AND d.annee = :annee")
    Double sumMontantByTypeAndAnnee(@Param("type") TypeDepense type,
                                    @Param("annee") Annee annee);

    // Stats par type (pour dashboard)
    @Query("SELECT d.typeDepense, SUM(d.montant) FROM Depense d " +
            "WHERE d.annee = :annee GROUP BY d.typeDepense")
    List<Object[]> statsParType(@Param("annee") Annee annee);

    @Query("SELECT d.typeDepense, SUM(d.montant) FROM Depense d " +
            "WHERE d.mois = :mois GROUP BY d.typeDepense")
    List<Object[]> statsParTypeEtMois(@Param("mois") Mois mois);

    // Dépenses sur une période
    @Query("SELECT SUM(d.montant) FROM Depense d WHERE " +
            "d.dateDepense BETWEEN :debut AND :fin")
    Double sumMontantByPeriode(@Param("debut") LocalDate debut,
                               @Param("fin") LocalDate fin);

}
