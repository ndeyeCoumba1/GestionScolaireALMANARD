package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Parent;
import com.example.GestionScolaire.Repository.ParentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentService {
    private final ParentRepository parentRepository;

    public List<Parent> findAll() {
        return parentRepository.findAll();
    }

    public Parent findById(Long id) {
        return parentRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Parent introuvable : " + id));
    }

    public List<Parent> search(String query) {
        return parentRepository.searchGlobal(query);
    }

    @Transactional
    public Parent create(Parent parent) {
        if (parentRepository.existsByEmail(parent.getEmail())) {
            throw AppException.conflict("Email déjà utilisé : " + parent.getEmail());
        }
        if (parentRepository.existsByTelephone(parent.getTelephone())) {
            throw AppException.conflict("Téléphone déjà utilisé : " + parent.getTelephone());
        }
        return parentRepository.save(parent);
    }

    @Transactional
    public Parent update(Long id, Parent updated) {
        Parent parent = findById(id);
        parent.setNom(updated.getNom());
        parent.setPrenom(updated.getPrenom());
        parent.setAdresse(updated.getAdresse());
        parent.setEmail(updated.getEmail());
        parent.setTelephone(updated.getTelephone());
        parent.setProfession(updated.getProfession());
        return parentRepository.save(parent);
    }

    public void delete(Long id) {
        Parent parent = findById(id);
        if (!parent.getEleves().isEmpty()) {
            throw AppException.badRequest("Impossible de supprimer : ce parent a des élèves liés");
        }
        parentRepository.deleteById(id);
    }
}
