package com.example.GestionScolaire.Config;

import com.example.GestionScolaire.Model.Eleve;
import com.example.GestionScolaire.Repository.EleveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
@RequiredArgsConstructor
public class MatriculeMigration implements CommandLineRunner {

    private final EleveRepository eleveRepository;

    @Override
    public void run(String... args) {
        // Ajouter des matricules aux élèves qui n'en ont pas
        int count = 0;
        for (Eleve eleve : eleveRepository.findAll()) {
            if (eleve.getMatricule() == null || eleve.getMatricule().isEmpty()) {
                String matricule = genererMatricule(eleve.getId());
                eleve.setMatricule(matricule);
                eleveRepository.save(eleve);
                count++;
            }
        }
        if (count > 0) {
            System.out.println("✅ " + count + " matricules générés pour les élèves existants");
        }
    }

    private String genererMatricule(Long id) {
        String annee = String.valueOf(Year.now().getValue());
        return "MAT-" + annee + "-" + String.format("%05d", id);
    }
}