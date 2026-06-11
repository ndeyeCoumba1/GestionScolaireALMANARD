package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Repository.EleveRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EleveService {

    private final EleveRepository eleveRepository;

    public List<Eleve> findAll() {
        return eleveRepository.findAll();
    }
    public List<Eleve> findByClasseId(Long classeId) {
        return eleveRepository.findByClasseId(classeId);
    }

    public Eleve findById(Long id) {
        return eleveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Eleve introuvable : " + id));
    }

    // ✅ Trouver par matricule
    public Eleve findByMatricule(String matricule) {
        return eleveRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Eleve introuvable avec matricule : " + matricule));
    }

    // ✅ Toutes les informations de l'élève avec ses relations
    public Eleve findByIdWithDetails(Long id) {
        return eleveRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Eleve introuvable : " + id));
    }

    // ✅ Génération automatique du matricule
    private String genererMatricule() {
        String annee = String.valueOf(Year.now().getValue());
        long count = eleveRepository.count() + 1;
        return "MAT-" + annee + "-" + String.format("%05d", count);
    }
    // ✅ Vérifier si un matricule est unique
    private boolean isMatriculeUnique(String matricule) {
        return !eleveRepository.existsByMatricule(matricule);
    }

    // ✅ Méthode pour réinitialiser le statut par matricule
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
        return eleveRepository.findAll().stream()
                .filter(e -> e.getClasse() != null &&
                        e.getClasse().getId().equals(classeId))
                .toList();
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
        return eleveRepository.save(eleve);
    }

    @Transactional
    public Eleve update(Long id, Eleve updated) {
        Eleve eleve = findById(id);
        eleve.setNom(updated.getNom());
        eleve.setPrenom(updated.getPrenom());
        eleve.setDateNaissance(updated.getDateNaissance());
        eleve.setSexe(updated.getSexe());
        eleve.setAdresse(updated.getAdresse());
        eleve.setClasse(updated.getClasse());
        eleve.setParent(updated.getParent());
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