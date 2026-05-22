package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Repository.EleveRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EleveService {

    private final EleveRepository eleveRepository;

    public List<Eleve> findAll() {
        return eleveRepository.findAll();
    }

    public Eleve findById(Long id) {
        return eleveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Eleve introuvable : " + id));
    }

    // ✅ Toutes les informations de l'élève avec ses relations
    public Eleve findByIdWithDetails(Long id) {
        return eleveRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Eleve introuvable : " + id));
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
    public void changerStatut(Long id, StatutEleve statut) {
        Eleve eleve = findById(id);
        eleve.setStatut(statut);
        eleveRepository.save(eleve);
    }

    public void delete(Long id) {
        eleveRepository.deleteById(id);
    }
}