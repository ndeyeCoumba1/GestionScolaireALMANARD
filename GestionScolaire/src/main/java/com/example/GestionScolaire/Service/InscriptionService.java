package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Model.Inscription;
import com.example.GestionScolaire.Repository.EleveRepository;
import com.example.GestionScolaire.Repository.InscriptionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscriptionService {
    private final InscriptionRepository inscriptionRepository;
    private final EleveRepository eleveRepository;
    private final AnneeService anneeService;
    private final EleveService eleveService;

    public List<Inscription> findAll() {
        return inscriptionRepository.findAll();
    }

    public List<Inscription> findByAnnee(Annee annee) {
        return inscriptionRepository.findByAnnee(annee);
    }

    public List<Inscription> findByEleve(Long eleveId) {
        Eleve eleve = eleveService.findById(eleveId);
        return inscriptionRepository.findByEleve(eleve);
    }
    public long countByAnnee(Annee annee) {
        return inscriptionRepository.countByAnnee(annee);
    }

    @Transactional
    public Inscription inscrire(Long eleveId, Long classeId, double fraisInscription) {
        Annee anneeActive = anneeService.findAnneeActive();
        Eleve eleve = eleveService.findById(eleveId);
        // Vérifier doublon
        if (inscriptionRepository.existsByEleveAndAnnee(eleve, anneeActive)) {
            throw new RuntimeException(
                    eleve.getNom() + " est déjà inscrit pour l'année " + anneeActive.getLibelle()
            );
        }

        Inscription inscription = new Inscription();
        inscription.setEleve(eleve);
        inscription.setAnnee(anneeActive);
        inscription.setDateInscription(LocalDate.now());
        inscription.setFraisInscription(fraisInscription);
        // Mettre à jour le statut de l'élève
        eleve.setStatut(StatutEleve.INSCRIT);
        eleveRepository.save(eleve);

        return inscriptionRepository.save(inscription);
    }

    public void delete(Long id) {
        inscriptionRepository.deleteById(id);
    }


}
