package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Mois;
import com.example.GestionScolaire.Repository.MoisRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MoisService {

    private final MoisRepository moisRepository;
    private final AnneeService   anneeService;

    public List<Mois> findAll() {
        return moisRepository.findAll();
    }

    public List<Mois> findByAnnee(Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return moisRepository.findByAnnee(annee);
    }

    public Mois findById(Long id) {
        return moisRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Mois introuvable : " + id));
    }

    public Mois findByLibelle(String libelle) {
        return moisRepository.findByLibelle(libelle)
                .orElseThrow(() -> AppException.notFound("Mois introuvable : " + libelle));
    }

    @Transactional
    public Mois create(Mois mois, Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        if (moisRepository.existsByLibelleAndAnnee(mois.getLibelle(), annee)) {
            throw AppException.conflict("Le mois " + mois.getLibelle() + " existe déjà pour cette année");
        }
        mois.setAnnee(annee);
        return moisRepository.save(mois);
    }

    @Transactional
    public Mois update(Long id, Mois updated) {
        Mois mois = findById(id);
        mois.setLibelle(updated.getLibelle());
        mois.setMontantScolarite(updated.getMontantScolarite());
        return moisRepository.save(mois);
    }

    public void delete(Long id) {
        moisRepository.deleteById(id);
    }
}