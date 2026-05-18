package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.TypeDepense;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Depense;
import com.example.GestionScolaire.Model.Mois;
import com.example.GestionScolaire.Repository.DepenseRepository;
import com.example.GestionScolaire.Repository.MoisRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepenseService {

    private final DepenseRepository depenseRepository;
    private final AnneeService anneeService;
    private final MoisRepository moisRepository;

    public List<Depense> findAll() {
        return (List<Depense>) depenseRepository.findAll();
    }

    public Depense findById(Long id) {
        return depenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Depense introuvable : " + id));
    }

    public List<Depense> findByAnnee(Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return depenseRepository.findByAnnee(annee);
    }

    public List<Depense> findByMois(Long moisId) {
        Mois mois = moisRepository.findById(moisId)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));
        return depenseRepository.findByMois(mois);
    }

    public List<Depense> findByAnneeAndMois(Long anneeId, Long moisId) {
        Annee annee = anneeService.findById(anneeId);
        Mois mois = moisRepository.findById(moisId)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));
        return depenseRepository.findByAnneeAndMois(annee, mois);
    }

    public List<Depense> findByType(TypeDepense type) {
        return depenseRepository.findByTypeDepense(type);
    }

    public List<Depense> findByPeriode(LocalDate debut, LocalDate fin) {
        return depenseRepository.findByDateDepenseBetween(debut, fin);
    }

    public Double totalParAnnee(Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return depenseRepository.sumMontantByAnnee(annee);
    }

    public Double totalParMois(Long moisId) {
        Mois mois = moisRepository.findById(moisId)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));
        return depenseRepository.sumMontantByMois(mois);
    }

    public Double totalParMoisEtAnnee(Long moisId, Long anneeId) {
        Mois mois = moisRepository.findById(moisId)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));
        Annee annee = anneeService.findById(anneeId);
        return depenseRepository.sumMontantByMoisAndAnnee(mois, annee);
    }

    public Double totalParPeriode(LocalDate debut, LocalDate fin) {
        return depenseRepository.sumMontantByPeriode(debut, fin);
    }

    public List<Object[]> statsParType(Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return depenseRepository.statsParType(annee);
    }

    public List<Object[]> statsParTypeEtMois(Long moisId) {
        Mois mois = moisRepository.findById(moisId)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));
        return depenseRepository.statsParTypeEtMois(mois);
    }

    @Transactional
    public Depense create(Depense depense) {
        if (depense.getAnnee() == null) {
            depense.setAnnee(anneeService.findAnneeActive());
        }
        if (depense.getDateDepense() == null) {
            depense.setDateDepense(LocalDate.now());
        }
        return depenseRepository.save(depense);
    }

    @Transactional
    public Depense update(Long id, Depense updated) {
        Depense depense = findById(id);
        depense.setDescription(updated.getDescription());
        depense.setTypeDepense(updated.getTypeDepense());
        depense.setMontant(updated.getMontant());
        depense.setDateDepense(updated.getDateDepense());
        depense.setMois(updated.getMois());
        return depenseRepository.save(depense);
    }

    public void delete(Long id) {
        depenseRepository.deleteById(id);
    }
}