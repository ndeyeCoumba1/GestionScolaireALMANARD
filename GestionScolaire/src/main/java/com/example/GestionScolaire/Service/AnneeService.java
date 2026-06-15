package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Repository.AnneeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnneeService {

    private final AnneeRepository anneeRepository;

    public List<Annee> findAll() {
        return anneeRepository.findAll();
    }

    public Annee findById(Long id) {
        return anneeRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Année introuvable avec l'id : " + id));
    }

    public Annee findAnneeActive() {
        return anneeRepository.findAnneeActive()
                .orElseThrow(() -> AppException.notFound("Aucune année scolaire active"));
    }

    @Transactional
    public Annee create(Annee annee) {
        if (anneeRepository.existsByLibelle(annee.getLibelle())) {
            throw AppException.conflict("L'année " + annee.getLibelle() + " existe déjà");
        }
        // Toute nouvelle année est inactive par défaut — utiliser /activer pour l'activer
        annee.setActif(false);
        return anneeRepository.save(annee);
    }

    @Transactional
    public Annee update(Long id, Annee updated) {
        Annee annee = findById(id);
        annee.setLibelle(updated.getLibelle());
        annee.setDateDebut(updated.getDateDebut());
        annee.setDateFin(updated.getDateFin());
        return anneeRepository.save(annee);
    }

    @Transactional
    public Annee activerAnnee(Long id) {
        anneeRepository.findAll().forEach(a -> {
            a.setActif(false);
            anneeRepository.save(a);
        });
        Annee annee = findById(id);
        annee.setActif(true);
        return anneeRepository.save(annee);
    }

    public void delete(Long id) {
        anneeRepository.deleteById(id);
    }
}