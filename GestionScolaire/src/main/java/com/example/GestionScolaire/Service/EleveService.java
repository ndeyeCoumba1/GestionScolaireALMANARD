package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Repository.ClasseRepository;
import com.example.GestionScolaire.Repository.EleveRepository;
import com.example.GestionScolaire.Repository.ParentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EleveService {

    private final EleveRepository  eleveRepository;
    private final ClasseRepository classeRepository;
    private final ParentRepository parentRepository;

    public List<Eleve> findAll() {
        return eleveRepository.findAll();
    }

    public List<Eleve> findByClasseId(Long classeId) {
        return eleveRepository.findByClasseId(classeId);
    }

    public Eleve findById(Long id) {
        return eleveRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Eleve introuvable : " + id));
    }

    public Eleve findByMatricule(String matricule) {
        return eleveRepository.findByMatricule(matricule)
                .orElseThrow(() -> AppException.notFound("Eleve introuvable avec matricule : " + matricule));
    }

    public Eleve findByIdWithDetails(Long id) {
        return eleveRepository.findByIdWithDetails(id)
                .orElseThrow(() -> AppException.notFound("Eleve introuvable : " + id));
    }

    private String genererMatricule() {
        String annee = String.valueOf(Year.now().getValue());
        long count = eleveRepository.count() + 1;
        return "MAT-" + annee + "-" + String.format("%05d", count);
    }

    private boolean isMatriculeUnique(String matricule) {
        return !eleveRepository.existsByMatricule(matricule);
    }

    @Transactional
    public void changerStatutByMatricule(String matricule, StatutEleve statut) {
        Eleve eleve = findByMatricule(matricule);
        eleve.setStatut(statut);
        eleveRepository.save(eleve);
    }

    public List<Eleve> search(String query) {
        return eleveRepository.searchGlobal(query);
    }

    public List<Eleve> findByClasse(Long classeId) {
        return eleveRepository.findByClasseId(classeId);
    }

    public long countByStatut(StatutEleve statut) {
        return eleveRepository.countByStatut(statut);
    }

    @Transactional
    public Eleve create(Eleve eleve) {
        eleve.setStatut(StatutEleve.NON_INSCRIT);
        String matricule = genererMatricule();
        while (!isMatriculeUnique(matricule)) {
            matricule = genererMatricule();
        }
        eleve.setMatricule(matricule);

        // Recharger Classe et Parent depuis la BDD pour éviter les entités détachées
        if (eleve.getClasse() != null && eleve.getClasse().getId() != null) {
            eleve.setClasse(classeRepository.findById(eleve.getClasse().getId()).orElse(null));
        }
        if (eleve.getParent() != null && eleve.getParent().getId() != null) {
            eleve.setParent(parentRepository.findById(eleve.getParent().getId()).orElse(null));
        }

        return eleveRepository.save(eleve);
    }

    @Transactional
    public Eleve update(Long id, Eleve updated) {
        Eleve eleve = findById(id);

        eleve.setNom(updated.getNom());
        eleve.setPrenom(updated.getPrenom());
        eleve.setNomArabe(updated.getNomArabe());
        eleve.setPrenomArabe(updated.getPrenomArabe());
        eleve.setDateNaissance(updated.getDateNaissance());
        eleve.setSexe(updated.getSexe());
        eleve.setAdresse(updated.getAdresse());
        eleve.setPhotoUrl(updated.getPhotoUrl());

        // Recharger Classe et Parent depuis la BDD pour éviter les entités détachées
        if (updated.getClasse() != null && updated.getClasse().getId() != null) {
            eleve.setClasse(classeRepository.findById(updated.getClasse().getId()).orElse(null));
        } else {
            eleve.setClasse(null);
        }

        if (updated.getParent() != null && updated.getParent().getId() != null) {
            eleve.setParent(parentRepository.findById(updated.getParent().getId()).orElse(null));
        } else {
            eleve.setParent(null);
        }

        return eleveRepository.save(eleve);
    }

    @Transactional
    public Eleve updateNomArabe(Long id, String nomArabe, String prenomArabe) {
        Eleve eleve = findById(id);
        eleve.setNomArabe(nomArabe);
        eleve.setPrenomArabe(prenomArabe);
        return eleveRepository.save(eleve);
    }

    @Transactional
    public void changerStatut(Long id, StatutEleve statut) {
        Eleve eleve = findById(id);
        eleve.setStatut(statut);
        eleveRepository.save(eleve);
    }

    public void delete(Long id) {
        eleveRepository.deleteById(id);
    }
}