package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.DTO.PaiementDTO;
import com.example.GestionScolaire.DTO.SituationPaiementDTO;
import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import com.example.GestionScolaire.Model.*;
import com.example.GestionScolaire.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaiementService {
    private final PaiementRepository paiementRepository;
    private final InscriptionRepository inscriptionRepository;
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
        eleveService.findById(eleveId);
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
    public Paiement enregistrer(Long eleveId, Double montant, Double montantAttendu,
                                TypePaiement typePaiement, MotifPaiement motif,
                                Long moisId, Long inscriptionId, User enregistrePar) {
        Eleve eleve = eleveService.findById(eleveId);
        Annee anneeActive = anneeService.findAnneeActive();

        // Vérifier doublon mensualité
        if (motif == MotifPaiement.MENSUALITE && moisId != null) {
            Mois mois = moisRepository.findById(moisId)
                    .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));
            if (paiementRepository.existsByEleveAndMoisAndStatut(eleve, mois, StatutPaiement.PAYE)) {
                throw new RuntimeException(
                        eleve.getNom() + " a déjà payé entièrement pour " + mois.getLibelle());
            }
        }

        // Statut selon montant partiel ou total
        StatutPaiement statut = (montantAttendu != null && montant < montantAttendu)
                ? StatutPaiement.PARTIEL
                : StatutPaiement.PAYE;

        Paiement paiement = new Paiement();
        paiement.setNumeroRecu(genererNumeroRecu());
        paiement.setEleve(eleve);
        paiement.setMontant(montant);
        paiement.setMontantAttendu(montantAttendu);
        paiement.setMotif(motif);
        paiement.setTypePaiement(typePaiement);
        paiement.setStatut(statut);
        paiement.setDatePaiement(LocalDate.now());
        paiement.setAnnee(anneeActive);
        paiement.setEnregistrePar(enregistrePar);

        if (moisId != null) {
            moisRepository.findById(moisId).ifPresent(paiement::setMois);
        }

        if (inscriptionId != null) {
            inscriptionRepository.findById(inscriptionId)
                    .ifPresent(paiement::setInscription);
        }

        Paiement saved = paiementRepository.save(paiement);

        if (inscriptionId != null) {
            majStatutInscription(inscriptionId);
        }

        return saved;
    }

    //  Modifier un paiement
    @Transactional
    public Paiement modifier(Long id, Double montant, Double montantAttendu,
                             TypePaiement typePaiement, MotifPaiement motif,
                             Long moisId, Long inscriptionId, User modifiePar) {
        Paiement paiement = findById(id);

        // Vérifier si le paiement peut être modifié
        if (paiement.getStatut() == StatutPaiement.ANNULE) {
            throw new RuntimeException("Impossible de modifier un paiement annulé");
        }

        // Vérifier doublon mensualité si le mois change
        if (motif == MotifPaiement.MENSUALITE && moisId != null) {
            Mois mois = moisRepository.findById(moisId)
                    .orElseThrow(() -> new RuntimeException("Mois introuvable : " + moisId));

            // Vérifier si un autre paiement existe déjà pour ce mois (sauf celui qu'on modifie)
            boolean existeDeja = paiementRepository.existsByEleveAndMoisAndStatutAndIdNot(
                    paiement.getEleve(), mois, StatutPaiement.PAYE, id);
            if (existeDeja) {
                throw new RuntimeException(
                        paiement.getEleve().getNom() + " a déjà payé entièrement pour " + mois.getLibelle());
            }
            paiement.setMois(mois);
        }

        // Mettre à jour les champs
        paiement.setMontant(montant);
        paiement.setMontantAttendu(montantAttendu);
        paiement.setMotif(motif);
        paiement.setTypePaiement(typePaiement);
        paiement.setEnregistrePar(modifiePar);

        // Recalculer le statut
        StatutPaiement nouveauStatut = (montantAttendu != null && montant < montantAttendu)
                ? StatutPaiement.PARTIEL
                : StatutPaiement.PAYE;
        paiement.setStatut(nouveauStatut);

        if (moisId != null) {
            moisRepository.findById(moisId).ifPresent(paiement::setMois);
        }

        if (inscriptionId != null) {
            Inscription inscription = inscriptionRepository.findById(inscriptionId)
                    .orElseThrow(() -> new RuntimeException("Inscription introuvable"));
            paiement.setInscription(inscription);
            majStatutInscription(inscriptionId);
        }

        return paiementRepository.save(paiement);
    }

    //  Supprimer un paiement
    @Transactional
    public void supprimer(Long id) {
        Paiement paiement = findById(id);

        // Vérifier si le paiement peut être supprimé
        if (paiement.getStatut() == StatutPaiement.PAYE) {
            throw new RuntimeException("Impossible de supprimer un paiement déjà validé. Veuillez d'abord l'annuler.");
        }

        Long inscriptionId = paiement.getInscription() != null ? paiement.getInscription().getId() : null;

        paiementRepository.delete(paiement);

        // Mettre à jour le statut de l'inscription si nécessaire
        if (inscriptionId != null) {
            majStatutInscription(inscriptionId);
        }
    }

    // Ancienne méthode conservée pour compatibilité
    @Transactional
    public Paiement enregistrer(Long eleveId, Double montant,
                                TypePaiement typePaiement, MotifPaiement motif,
                                Long moisId, Long inscriptionId, User enregistrePar) {
        return enregistrer(eleveId, montant, null, typePaiement, motif, moisId, inscriptionId, enregistrePar);
    }

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

    @Transactional
    public Paiement annuler(Long id) {
        Paiement paiement = findById(id);
        paiement.setStatut(StatutPaiement.ANNULE);
        return paiementRepository.save(paiement);
    }

    //  Utilise SituationPaiementDTO, pas PaiementDTO
    public SituationPaiementDTO getSituationByInscription(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable : " + inscriptionId));

        Double fraisTotal = inscription.getFraisInscription() != null
                ? inscription.getFraisInscription() : 0.0;
        Double fraisPaye = paiementRepository
                .sumMontantByInscriptionAndMotif(inscriptionId, MotifPaiement.INSCRIPTION);
        Double fraisRestant = Math.max(0, fraisTotal - fraisPaye);

        List<PaiementDTO> historique = paiementRepository
                .findByInscriptionIdOrderByDatePaiementDesc(inscriptionId)
                .stream().map(this::toDTO).collect(Collectors.toList());

        SituationPaiementDTO dto = new SituationPaiementDTO();
        dto.setFraisInscriptionTotal(fraisTotal);
        dto.setFraisInscriptionPaye(fraisPaye);
        dto.setFraisInscriptionRestant(fraisRestant);
        dto.setStatutGlobal(inscription.getStatutPaiement());
        dto.setHistorique(historique);
        return dto;
    }

    private void majStatutInscription(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable"));

        Double totalDu = inscription.getFraisInscription() != null
                ? inscription.getFraisInscription() : 0.0;
        Double totalPaye = paiementRepository
                .sumMontantByInscriptionAndMotif(inscriptionId, MotifPaiement.INSCRIPTION);

        StatutPaiement statut;
        if (totalPaye == null || totalPaye <= 0) statut = StatutPaiement.IMPAYE;
        else if (totalPaye >= totalDu)           statut = StatutPaiement.PAYE;
        else                                     statut = StatutPaiement.PARTIEL;

        inscription.setStatutPaiement(statut);
        inscriptionRepository.save(inscription);
    }

    private PaiementDTO toDTO(Paiement p) {
        PaiementDTO dto = new PaiementDTO();
        dto.setId(p.getId());
        dto.setNumeroRecu(p.getNumeroRecu());
        dto.setMontant(p.getMontant());
        dto.setDatePaiement(p.getDatePaiement());
        dto.setMotif(p.getMotif());
        dto.setStatut(p.getStatut());
        dto.setTypePaiement(p.getTypePaiement());
        if (p.getEleve() != null) {
            dto.setEleveNom(p.getEleve().getNom());
            dto.setElevePrenom(p.getEleve().getPrenom());
        }
        if (p.getMois() != null)        dto.setMoisLibelle(p.getMois().getLibelle());
        if (p.getAnnee() != null)       dto.setAnneeLibelle(p.getAnnee().getLibelle());
        if (p.getEnregistrePar() != null) dto.setEnregistreParNom(p.getEnregistrePar().getNom());
        return dto;
    }

    private String genererNumeroRecu() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "REC-" + date + "-" + suffix;
    }
}