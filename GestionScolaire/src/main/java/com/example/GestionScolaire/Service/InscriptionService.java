package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Annee;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Model.Inscription;
import com.example.GestionScolaire.Repository.EleveRepository;
import com.example.GestionScolaire.Repository.ClasseRepository;
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
    private final ClasseRepository classeRepository;

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
        Classe classe = classeRepository.findById(classeId)
                .orElseThrow(() -> AppException.notFound("Classe non trouvée avec ID: " + classeId));

        if (inscriptionRepository.existsByEleveAndAnnee(eleve, anneeActive)) {
            throw AppException.conflict(
                    eleve.getNom() + " est déjà inscrit pour l'année " + anneeActive.getLibelle()
            );
        }

        Inscription inscription = new Inscription();
        inscription.setEleve(eleve);
        inscription.setClasse(classe);
        inscription.setAnnee(anneeActive);
        inscription.setDateInscription(LocalDate.now());
        inscription.setFraisInscription(fraisInscription);

        eleve.setStatut(StatutEleve.INSCRIT);
        eleveRepository.save(eleve);

        return inscriptionRepository.save(inscription);
    }

    public Inscription findById(Long id) {
        return inscriptionRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Inscription introuvable : " + id));
    }

    public Inscription updateFrais(Long id, double fraisInscription) {
        Inscription inscription = findById(id);
        inscription.setFraisInscription(fraisInscription);
        return inscriptionRepository.save(inscription);
    }

    public void delete(Long id) {
        inscriptionRepository.deleteById(id);
    }
}