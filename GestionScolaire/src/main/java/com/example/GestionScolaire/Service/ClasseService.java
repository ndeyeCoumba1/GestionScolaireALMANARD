package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Repository.ClasseRepository;
import com.example.GestionScolaire.Repository.InscriptionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClasseService {

    private final ClasseRepository     classeRepository;
    private final InscriptionRepository inscriptionRepository;

    public List<Classe> findAll() {
        return classeRepository.findAll();
    }

    public List<Classe> findByNiveau(NiveauClasse niveau) {
        return classeRepository.findByNiveau(niveau);
    }

    public List<Classe> findClassesDisponibles() {
        return classeRepository.findClassesDisponibles();
    }

    public Classe findById(Long id) {
        return classeRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Classe introuvable : " + id));
    }

    public long countEleves(Long classeId) {
        return classeRepository.countElevesInClasse(classeId);
    }

    @Transactional
    public Classe create(Classe classe) {
        return classeRepository.save(classe);
    }

    @Transactional
    public Classe update(Long id, Classe updated) {
        Classe classe = findById(id);
        classe.setNiveau(updated.getNiveau());
        classe.setCapaciteMax(updated.getCapaciteMax());
        classe.setEnseignant(updated.getEnseignant());
        return classeRepository.save(classe);
    }

    @Transactional
    public void delete(Long id) {
        Classe classe = findById(id);

        if (classe.getEleves() != null && !classe.getEleves().isEmpty()) {
            throw AppException.badRequest(
                    "Impossible de supprimer : " + classe.getEleves().size() +
                    " élève(s) sont encore affectés à cette classe. Désaffectez-les d'abord.");
        }

        if (inscriptionRepository.existsByClasse(classe)) {
            throw AppException.badRequest(
                    "Impossible de supprimer : cette classe possède des inscriptions historiques. " +
                    "Supprimez d'abord les inscriptions liées.");
        }

        classeRepository.deleteById(id);
    }
}