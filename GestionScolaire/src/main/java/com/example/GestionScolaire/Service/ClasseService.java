package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Model.Classe;
import com.example.GestionScolaire.Repository.ClasseRepository;
import jakarta.transaction.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClasseService {


    private final ClasseRepository classeRepository;

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
                .orElseThrow(() -> new RuntimeException("Classe introuvable : " + id));
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

    public void delete(Long id) {
        Classe classe = findById(id);
        if (!classe.getEleves().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer : la classe contient des élèves");
        }
        classeRepository.deleteById(id);
    }
}
