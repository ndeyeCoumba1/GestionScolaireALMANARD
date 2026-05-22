package com.example.GestionScolaire.Service;


import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import com.example.GestionScolaire.Model.*;
import com.example.GestionScolaire.Repository.MoisRepository;
import com.example.GestionScolaire.Repository.PaiementRepository;
import com.example.GestionScolaire.Repository.ParentRepository;
import com.example.GestionScolaire.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementService {
    private final PaiementRepository paiementRepository;
    private final EleveService eleveService;
    private final AnneeService anneeService;
    private final MoisRepository moisRepository;

    public List<Paiement> findAll() {
        return paiementRepository.findAll();
    }

    public Paiement findById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable : " + id));
    }

    public List<Paiement> findByEleve(Long eleveId) {
        Eleve eleve = eleveService.findById(eleveId);
        return paiementRepository.findByEleveId(eleveId);
    }
    public List<Paiement> findEnAttente() {
        return paiementRepository.findAllByStatutOrderByDate(StatutPaiement.EN_ATTENTE);
    }

    public Double totalParAnnee(Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return paiementRepository.sumMontantByAnnee(StatutPaiement.PAYE, annee);
    }

    public Double totalParPeriode(LocalDate debut, LocalDate fin) {
        return paiementRepository.sumMontantByPeriode(StatutPaiement.PAYE, debut, fin);
    }

    public List<Object[]> statsParMois(Long anneeId) {
        Annee annee = anneeService.findById(anneeId);
        return paiementRepository.statsParMois(annee, StatutPaiement.PAYE);
    }
    @Transactional
    public Paiement enregistrer(Long eleveId, Double montant,
                                TypePaiement typePaiement, MotifPaiement motif, Long moisId, User enregistrePar) {
        Eleve eleve = eleveService.findById(eleveId);
        Annee anneeActive = anneeService.findAnneeActive();

        // Vérifier doublon mensualité
        if (motif == MotifPaiement.MENSUALITE && moisId != null) {
            Mois mois = moisRepository.findById(moisId)
                    .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));

            if (paiementRepository.existsByEleveAndMoisAndStatut(
                    eleve, mois, StatutPaiement.PAYE)) {
                throw new RuntimeException(
                        eleve.getNom() + " a déjà payé pour le mois de " + mois.getLibelle()
                );
            }
        }
        Paiement paiement = new Paiement();
        paiement.setNumeroRecu(genererNumeroRecu());
        paiement.setEleve(eleve);
        paiement.setMontant(montant);
        paiement.setMotif(motif);
        paiement.setTypePaiement(typePaiement);
        paiement.setStatut(StatutPaiement.PAYE);
        paiement.setDatePaiement(LocalDate.now());
        paiement.setAnnee(anneeActive);
        paiement.setEnregistrePar(enregistrePar);

        if (moisId != null) {
            moisRepository.findById(moisId).ifPresent(paiement::setMois);
        }

        return paiementRepository.save(paiement);
    }
    // Passer un paiement EN_ATTENTE → PAYE
    @Transactional
    public Paiement valider(Long id) {
        Paiement paiement = findById(id);
        if (paiement.getStatut() == StatutPaiement.PAYE) {
            throw new RuntimeException("Ce paiement est déjà validé");
        }
        paiement.setStatut(StatutPaiement.PAYE);
        paiement.setDatePaiement(LocalDate.now());
        return paiementRepository.save(paiement);
    }
    // Annuler un paiement
    @Transactional
    public Paiement annuler(Long id) {
        Paiement paiement = findById(id);
        paiement.setStatut(StatutPaiement.ANNULE);
        return paiementRepository.save(paiement);
    }
    // Génère un numéro de reçu unique : REC-20250513-XXXX
    private String genererNumeroRecu() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "REC-" + date + "-" + suffix;
    }



}
