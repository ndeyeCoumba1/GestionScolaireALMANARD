package com.example.GestionScolaire.Service;

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

    public List<Mois> findAll() {
        return moisRepository.findAll();
    }

    public Mois findById(Long id) {
        return moisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + id));
    }

    public Mois findByLibelle(String libelle) {
        return moisRepository.findByLibelle(libelle)
                .orElseThrow(() -> new RuntimeException("Mois introuvable : " + libelle));
    }
    @Transactional
    public Mois create(Mois mois) {
        if (moisRepository.existsByLibelle(mois.getLibelle())) {
            throw new RuntimeException("Le mois " + mois.getLibelle() + " existe deja");
        }
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
