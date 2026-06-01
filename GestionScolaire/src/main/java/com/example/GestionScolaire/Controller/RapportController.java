package com.example.GestionScolaire.Controller;

import com.example.GestionScolaire.Repository.DepenseRepository;
import com.example.GestionScolaire.Repository.PaiementRepository;
import com.example.GestionScolaire.Enum.StatutPaiement;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
public class RapportController {

    private final PaiementRepository paiementRepository;
    private final DepenseRepository depenseRepository;

    // ✅ Rapport journalier
    @GetMapping("/journalier")
    public ResponseEntity<Map<String, Object>> journalier(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate jour = date != null ? date : LocalDate.now();

        Double paiements = paiementRepository.sumMontantByPeriode(
                StatutPaiement.PAYE, jour, jour);
        Double depenses = depenseRepository.sumMontantByPeriode(jour, jour);

        return ResponseEntity.ok(Map.of(
                "date", jour.toString(),
                "paiements", paiements != null ? paiements : 0,
                "depenses", depenses != null ? depenses : 0,
                "solde", (paiements != null ? paiements : 0)
                        - (depenses != null ? depenses : 0)
        ));
    }

    // ✅ Rapport hebdomadaire
    @GetMapping("/hebdomadaire")
    public ResponseEntity<Map<String, Object>> hebdomadaire(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate ref = date != null ? date : LocalDate.now();
        WeekFields wf = WeekFields.of(Locale.FRANCE);
        LocalDate debut = ref.with(wf.dayOfWeek(), 1);
        LocalDate fin = debut.plusDays(6);

        Double paiements = paiementRepository.sumMontantByPeriode(
                StatutPaiement.PAYE, debut, fin);
        Double depenses = depenseRepository.sumMontantByPeriode(debut, fin);

        // Détail par jour
        var detailPaiements = paiementRepository.findByDatePaiementBetween(debut, fin);
        var detailDepenses = depenseRepository.findByDateDepenseBetween(debut, fin);

        return ResponseEntity.ok(Map.of(
                "debut", debut.toString(),
                "fin", fin.toString(),
                "paiements", paiements != null ? paiements : 0,
                "depenses", depenses != null ? depenses : 0,
                "solde", (paiements != null ? paiements : 0)
                        - (depenses != null ? depenses : 0),
                "detailPaiements", detailPaiements,
                "detailDepenses", detailDepenses
        ));
    }

    // ✅ Rapport mensuel
    @GetMapping("/mensuel")
    public ResponseEntity<Map<String, Object>> mensuel(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {

        int m = mois != null ? mois : LocalDate.now().getMonthValue();
        int a = annee != null ? annee : LocalDate.now().getYear();

        LocalDate debut = LocalDate.of(a, m, 1);
        LocalDate fin = debut.withDayOfMonth(debut.lengthOfMonth());

        Double paiements = paiementRepository.sumMontantByPeriode(
                StatutPaiement.PAYE, debut, fin);
        Double depenses = depenseRepository.sumMontantByPeriode(debut, fin);

        var detailPaiements = paiementRepository.findByDatePaiementBetween(debut, fin);
        var detailDepenses = depenseRepository.findByDateDepenseBetween(debut, fin);

        return ResponseEntity.ok(Map.of(
                "mois", m,
                "annee", a,
                "debut", debut.toString(),
                "fin", fin.toString(),
                "paiements", paiements != null ? paiements : 0,
                "depenses", depenses != null ? depenses : 0,
                "solde", (paiements != null ? paiements : 0)
                        - (depenses != null ? depenses : 0),
                "detailPaiements", detailPaiements,
                "detailDepenses", detailDepenses
        ));
    }
}