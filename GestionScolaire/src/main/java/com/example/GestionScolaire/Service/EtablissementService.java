package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.Etablissement;
import com.example.GestionScolaire.Repository.EtablissementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EtablissementService {
    private final EtablissementRepository etablissementRepository;

    public Etablissement create(Etablissement etablissement) {
        return etablissementRepository.save(etablissement);
    }

    public Etablissement findEtablissement() {
        return etablissementRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> AppException.notFound("Aucun établissement configuré"));
    }

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