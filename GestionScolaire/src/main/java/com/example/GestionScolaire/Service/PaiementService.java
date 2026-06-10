package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.DTO.PaiementDTO;
import com.example.GestionScolaire.DTO.PaiementSearchDTO;
import com.example.GestionScolaire.DTO.SituationPaiementDTO;
import com.example.GestionScolaire.Enum.MotifPaiement;
import com.example.GestionScolaire.Enum.StatutEleve;
import com.example.GestionScolaire.Enum.StatutPaiement;
import com.example.GestionScolaire.Enum.TypePaiement;
import com.example.GestionScolaire.Exception.PaiementException;
import com.example.GestionScolaire.Model.*;
import com.example.GestionScolaire.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepository    paiementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final EleveRepository       eleveRepository;
    private final EleveService          eleveService;
    private final AnneeService          anneeService;
    private final MoisRepository        moisRepository;

    // ═══════════════════════════════════════════
    //  Lecture
    // ═══════════════════════════════════════════

    public List<Paiement> findAll() {
        return paiementRepository.findAll();
    }

    public Paiement findById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> PaiementException.notFound("Paiement introuvable : " + id));
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

    // ═══════════════════════════════════════════
    //  Situation par inscription
    // ═══════════════════════════════════════════

    public SituationPaiementDTO getSituationByInscription(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> PaiementException.notFound("Inscription introuvable : " + inscriptionId));

        Double fraisTotal   = inscription.getFraisInscription() != null ? inscription.getFraisInscription() : 0.0;
        Double fraisPaye    = paiementRepository.sumMontantByInscriptionAndMotif(inscriptionId, MotifPaiement.INSCRIPTION);
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

    // ═══════════════════════════════════════════
    //  Situation annuelle d'un élève
    // ═══════════════════════════════════════════

    public PaiementSearchDTO.SituationAnnuelleEleveDTO getSituationAnnuelleEleve(Long eleveId, Long anneeId) {
        Eleve eleve  = eleveService.findById(eleveId);
        Annee annee  = anneeService.findById(anneeId);

        // Tous les paiements mensualité de cet élève pour l'année
        List<Paiement> paiements = paiementRepository.findByEleveIdAndAnneeId(eleveId, anneeId);

        // Tous les mois connus (indépendants de l'année)
        List<Mois> tousLesMois = moisRepository.findAll();

        List<PaiementSearchDTO.SituationMensuelleDTO> situationsMois = tousLesMois.stream()
                .map(mois -> {
                    Paiement p = paiements.stream()
                            .filter(pay -> pay.getMois() != null && pay.getMois().getId().equals(mois.getId()))
                            .findFirst()
                            .orElse(null);

                    Double montantAttendu = mois.getMontantScolarite();
                    Double montantPaye    = p != null ? (p.getMontant() != null ? p.getMontant() : 0.0) : 0.0;
                    Double reste          = montantAttendu != null ? Math.max(0, montantAttendu - montantPaye) : null;
                    StatutPaiement statut = p != null ? p.getStatut() : StatutPaiement.IMPAYE;

                    return PaiementSearchDTO.SituationMensuelleDTO.builder()
                            .moisId(mois.getId())
                            .moisLibelle(mois.getLibelle())
                            .montantAttendu(montantAttendu)
                            .montantPaye(montantPaye)
                            .resteAPayer(reste)
                            .statut(statut)
                            .numeroRecu(p != null ? p.getNumeroRecu() : null)
                            .datePaiement(p != null ? p.getDatePaiement() : null)
                            .typePaiement(p != null ? p.getTypePaiement() : null)
                            .build();
                })
                .toList();

        double totalAttendu = tousLesMois.stream()
                .mapToDouble(m -> m.getMontantScolarite() != null ? m.getMontantScolarite() : 0)
                .sum();
        double totalPaye = paiements.stream()
                .filter(p -> p.getStatut() == StatutPaiement.PAYE || p.getStatut() == StatutPaiement.PARTIEL)
                .mapToDouble(p -> p.getMontant() != null ? p.getMontant() : 0)
                .sum();

        return PaiementSearchDTO.SituationAnnuelleEleveDTO.builder()
                .eleveId(eleveId)
                .eleveNom(eleve.getNom())
                .elevePrenom(eleve.getPrenom())
                .matricule(eleve.getMatricule())
                .totalAttendu(totalAttendu)
                .totalPaye(totalPaye)
                .totalRestant(Math.max(0, totalAttendu - totalPaye))
                .mois(situationsMois)
                .build();
    }

    // ═══════════════════════════════════════════
    //  Impayés par classe et par mois
    // ═══════════════════════════════════════════

    public List<PaiementSearchDTO.EleveImpayeDTO> getImpayesByClasse(Long classeId, Long moisId) {
        List<Eleve> tousEleves = eleveRepository.findByClasseId(classeId);

        Set<Long> elevesPayesIds = paiementRepository
                .findByMoisIdAndStatutIn(moisId, List.of(StatutPaiement.PAYE, StatutPaiement.PARTIEL))
                .stream()
                .map(p -> p.getEleve().getId())
                .collect(Collectors.toSet());

        Mois mois = moisRepository.findById(moisId).orElse(null);
        Double montantAttendu = mois != null ? mois.getMontantScolarite() : null;

        return tousEleves.stream()
                .filter(e -> !elevesPayesIds.contains(e.getId()))
                .map(e -> PaiementSearchDTO.EleveImpayeDTO.builder()
                        .eleveId(e.getId())
                        .nom(e.getNom())
                        .prenom(e.getPrenom())
                        .matricule(e.getMatricule())
                        .classeNom(e.getClasse() != null && e.getClasse().getNiveau() != null
                                ? e.getClasse().getNiveau().name() : null)
                        .montantAttendu(montantAttendu)
                        .build())
                .sorted(Comparator.comparing(PaiementSearchDTO.EleveImpayeDTO::getNom))
                .toList();
    }

    // ═══════════════════════════════════════════
    //  Taux de recouvrement d'un mois
    // ═══════════════════════════════════════════

    public PaiementSearchDTO.TauxRecouvrementDTO getTauxRecouvrement(Long anneeId, Long moisId) {
        Annee annee = anneeService.findById(anneeId);
        Mois  mois  = moisRepository.findById(moisId)
                .orElseThrow(() -> PaiementException.notFound("Mois introuvable : " + moisId));

        long totalEleves = inscriptionRepository.countByAnnee(annee);

        List<Paiement> paiementsMois = paiementRepository
                .findByMoisIdAndStatutIn(moisId, List.of(StatutPaiement.PAYE, StatutPaiement.PARTIEL));

        long elevesPayes = paiementsMois.stream()
                .map(p -> p.getEleve().getId())
                .distinct().count();

        double montantRecu    = paiementsMois.stream()
                .mapToDouble(p -> p.getMontant() != null ? p.getMontant() : 0).sum();
        double montantAttendu = totalEleves * (mois.getMontantScolarite() != null ? mois.getMontantScolarite() : 0);
        int    taux           = totalEleves > 0 ? (int) Math.round((double) elevesPayes / totalEleves * 100) : 0;

        return PaiementSearchDTO.TauxRecouvrementDTO.builder()
                .moisId(moisId)
                .moisLibelle(mois.getLibelle())
                .totalEleves((int) totalEleves)
                .elevesPayes((int) elevesPayes)
                .elevesImpaye((int) (totalEleves - elevesPayes))
                .montantAttendu(montantAttendu)
                .montantRecu(montantRecu)
                .tauxRecouvrement(taux)
                .build();
    }

    // ═══════════════════════════════════════════
    //  Recherche multi-critères
    // ═══════════════════════════════════════════

    public List<PaiementDTO> rechercher(Long anneeId, Long moisId, StatutPaiement statut, Long classeId) {
        return paiementRepository.findAll().stream()
                .filter(p -> anneeId  == null || (p.getAnnee()  != null && p.getAnnee().getId().equals(anneeId)))
                .filter(p -> moisId   == null || (p.getMois()   != null && p.getMois().getId().equals(moisId)))
                .filter(p -> statut   == null || p.getStatut() == statut)
                .filter(p -> classeId == null || (p.getEleve() != null
                        && p.getEleve().getClasse() != null
                        && p.getEleve().getClasse().getId().equals(classeId)))
                .sorted(Comparator.comparing(
                        p -> p.getDatePaiement() != null ? p.getDatePaiement() : LocalDate.MIN,
                        Comparator.reverseOrder()))
                .map(this::toDTO)
                .toList();
    }

    // ═══════════════════════════════════════════
    //  Enregistrement
    // ═══════════════════════════════════════════

    @Transactional
    public Paiement enregistrer(Long eleveId, Double montant, Double montantAttendu,
                                TypePaiement typePaiement, MotifPaiement motif,
                                Long moisId, Long inscriptionId, User enregistrePar) {
        if (montant == null || montant <= 0) {
            throw PaiementException.badRequest("Le montant doit être supérieur à zéro");
        }

        Eleve eleve      = eleveService.findById(eleveId);
        Annee anneeActive = anneeService.findAnneeActive();

        if (motif == MotifPaiement.MENSUALITE && moisId != null) {
            Mois mois = moisRepository.findById(moisId)
                    .orElseThrow(() -> PaiementException.notFound("Mois introuvable : " + moisId));
            if (paiementRepository.existsByEleveAndMoisAndStatut(eleve, mois, StatutPaiement.PAYE)) {
                throw PaiementException.conflict(
                        eleve.getNom() + " a déjà payé entièrement pour " + mois.getLibelle());
            }
        }

        StatutPaiement statut = (montantAttendu != null && montant < montantAttendu)
                ? StatutPaiement.PARTIEL : StatutPaiement.PAYE;

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
            inscriptionRepository.findById(inscriptionId).ifPresent(paiement::setInscription);
        }

        Paiement saved = paiementRepository.save(paiement);
        if (inscriptionId != null) majStatutInscription(inscriptionId);
        return saved;
    }

    /** Surcharge pour compatibilité ascendante */
    @Transactional
    public Paiement enregistrer(Long eleveId, Double montant, TypePaiement typePaiement,
                                MotifPaiement motif, Long moisId, Long inscriptionId, User enregistrePar) {
        return enregistrer(eleveId, montant, null, typePaiement, motif, moisId, inscriptionId, enregistrePar);
    }

    // ═══════════════════════════════════════════
    //  Modification
    // ═══════════════════════════════════════════

    @Transactional
    public Paiement modifier(Long id, Double montant, Double montantAttendu,
                             TypePaiement typePaiement, MotifPaiement motif,
                             Long moisId, Long inscriptionId, User modifiePar) {
        if (montant == null || montant <= 0) {
            throw PaiementException.badRequest("Le montant doit être supérieur à zéro");
        }

        Paiement paiement = findById(id);

        if (paiement.getStatut() == StatutPaiement.ANNULE) {
            throw PaiementException.forbidden("Impossible de modifier un paiement annulé");
        }

        if (motif == MotifPaiement.MENSUALITE && moisId != null) {
            Mois mois = moisRepository.findById(moisId)
                    .orElseThrow(() -> PaiementException.notFound("Mois introuvable : " + moisId));
            if (paiementRepository.existsByEleveAndMoisAndStatutAndIdNot(
                    paiement.getEleve(), mois, StatutPaiement.PAYE, id)) {
                throw PaiementException.conflict(
                        paiement.getEleve().getNom() + " a déjà payé entièrement pour " + mois.getLibelle());
            }
            paiement.setMois(mois);
        }

        paiement.setMontant(montant);
        paiement.setMontantAttendu(montantAttendu);
        paiement.setMotif(motif);
        paiement.setTypePaiement(typePaiement);
        paiement.setModifiePar(modifiePar);
        paiement.setDateModification(LocalDateTime.now());

        StatutPaiement nouveauStatut = (montantAttendu != null && montant < montantAttendu)
                ? StatutPaiement.PARTIEL : StatutPaiement.PAYE;
        paiement.setStatut(nouveauStatut);

        if (moisId != null) {
            moisRepository.findById(moisId).ifPresent(paiement::setMois);
        }
        if (inscriptionId != null) {
            Inscription inscription = inscriptionRepository.findById(inscriptionId)
                    .orElseThrow(() -> PaiementException.notFound("Inscription introuvable : " + inscriptionId));
            paiement.setInscription(inscription);
            majStatutInscription(inscriptionId);
        }

        return paiementRepository.save(paiement);
    }

    // ═══════════════════════════════════════════
    //  Validation / Annulation / Suppression
    // ═══════════════════════════════════════════

    @Transactional
    public Paiement valider(Long id, User validePar) {
        Paiement paiement = findById(id);
        if (paiement.getStatut() == StatutPaiement.PAYE) {
            throw PaiementException.conflict("Ce paiement est déjà validé");
        }
        paiement.setStatut(StatutPaiement.PAYE);
        paiement.setDatePaiement(LocalDate.now());
        paiement.setModifiePar(validePar);
        paiement.setDateModification(LocalDateTime.now());
        return paiementRepository.save(paiement);
    }

    @Transactional
    public Paiement annuler(Long id, User annulePar) {
        Paiement paiement = findById(id);
        if (paiement.getStatut() == StatutPaiement.ANNULE) {
            throw PaiementException.conflict("Ce paiement est déjà annulé");
        }
        paiement.setStatut(StatutPaiement.ANNULE);
        paiement.setModifiePar(annulePar);
        paiement.setDateModification(LocalDateTime.now());
        Paiement saved = paiementRepository.save(paiement);
        if (paiement.getInscription() != null) {
            majStatutInscription(paiement.getInscription().getId());
        }
        return saved;
    }

    @Transactional
    public void supprimer(Long id) {
        Paiement paiement = findById(id);
        if (paiement.getStatut() == StatutPaiement.PAYE) {
            throw PaiementException.forbidden(
                    "Impossible de supprimer un paiement validé. Veuillez d'abord l'annuler.");
        }
        Long inscriptionId = paiement.getInscription() != null ? paiement.getInscription().getId() : null;
        paiementRepository.delete(paiement);
        if (inscriptionId != null) majStatutInscription(inscriptionId);
    }

    // ═══════════════════════════════════════════
    //  Helpers privés
    // ═══════════════════════════════════════════

    private void majStatutInscription(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> PaiementException.notFound("Inscription introuvable : " + inscriptionId));

        Double totalDu   = inscription.getFraisInscription() != null ? inscription.getFraisInscription() : 0.0;
        Double totalPaye = paiementRepository.sumMontantByInscriptionAndMotif(inscriptionId, MotifPaiement.INSCRIPTION);

        StatutPaiement statut;
        if (totalPaye == null || totalPaye <= 0) statut = StatutPaiement.IMPAYE;
        else if (totalPaye >= totalDu)           statut = StatutPaiement.PAYE;
        else                                     statut = StatutPaiement.PARTIEL;

        inscription.setStatutPaiement(statut);
        inscriptionRepository.save(inscription);
    }

    public PaiementDTO toDTO(Paiement p) {
        PaiementDTO dto = new PaiementDTO();
        dto.setId(p.getId());
        dto.setNumeroRecu(p.getNumeroRecu());
        dto.setMontant(p.getMontant());
        dto.setMontantAttendu(p.getMontantAttendu());
        dto.setDatePaiement(p.getDatePaiement());
        dto.setMotif(p.getMotif());
        dto.setStatut(p.getStatut());
        dto.setTypePaiement(p.getTypePaiement());
        if (p.getEleve() != null) {
            dto.setEleveNom(p.getEleve().getNom());
            dto.setElevePrenom(p.getEleve().getPrenom());
            dto.setMatricule(p.getEleve().getMatricule());
            if (p.getEleve().getClasse() != null && p.getEleve().getClasse().getNiveau() != null) {
                dto.setClasseNom(p.getEleve().getClasse().getNiveau().name());
            }
        }
        if (p.getMois()         != null) dto.setMoisLibelle(p.getMois().getLibelle());
        if (p.getAnnee()        != null) dto.setAnneeLibelle(p.getAnnee().getLibelle());
        if (p.getEnregistrePar()!= null) dto.setEnregistreParNom(p.getEnregistrePar().getNom());
        if (p.getModifiePar()   != null) dto.setModifieParNom(p.getModifiePar().getNom());
        dto.setDateModification(p.getDateModification());
        return dto;
    }

    private String genererNumeroRecu() {
        String date   = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "REC-" + date + "-" + suffix;
    }
}