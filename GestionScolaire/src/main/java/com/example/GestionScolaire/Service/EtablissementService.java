package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Model.Etablissement;
import com.example.GestionScolaire.Repository.EtablissementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EtablissementService {
    private final EtablissementRepository etablissementRepository;

    // Créer un établissement
    public Etablissement create(Etablissement etablissement) {
        return etablissementRepository.save(etablissement);
    }



    // Récupérer l'unique établissement
    public Etablissement findEtablissement() {
        return etablissementRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun etablissement configure"));
    }

    // Modifier les infos de l'école
    @Transactional
    public Etablissement update(Long id, Etablissement updated) {
        Etablissement etablissement = findEtablissement();
        etablissement.setNom(updated.getNom());
        etablissement.setAdresse(updated.getAdresse());
        etablissement.setTelephone(updated.getTelephone());
        etablissement.setEmail(updated.getEmail());
        etablissement.setLogoUrl(updated.getLogoUrl());
        return etablissementRepository.save(etablissement);
    }
}

