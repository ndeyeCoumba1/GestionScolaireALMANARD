package com.example.GestionScolaire.DTO;

import com.example.GestionScolaire.Model.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActif(user.getActif());
        return dto;
    }

    public EleveDTO toEleveDTO(Eleve e) {
        EleveDTO dto = new EleveDTO();
        dto.setId(e.getId());
        dto.setMatricule(e.getMatricule());
        dto.setNom(e.getNom());
        dto.setPrenom(e.getPrenom());
        dto.setDateNaissance(e.getDateNaissance());
        dto.setSexe(e.getSexe());
        dto.setAdresse(e.getAdresse());
        dto.setPhotoUrl(e.getPhotoUrl());
        dto.setStatut(e.getStatut());

        if (e.getClasse() != null) {
            dto.setClasseId(e.getClasse().getId());
            dto.setClasseRegime(e.getClasse().getNiveau());       // ✅ enum direct, plus de conversion String
            dto.setClasseStatut(e.getClasse().getStatut());
            dto.setClasseCapaciteMax(e.getClasse().getCapaciteMax());

            if (e.getClasse().getEnseignant() != null) {
                dto.setEnseignantId(e.getClasse().getEnseignant().getId());
                dto.setEnseignantNom(e.getClasse().getEnseignant().getNom());
                dto.setEnseignantPrenom(e.getClasse().getEnseignant().getPrenom());
            }
        }

        if (e.getParent() != null) {
            dto.setParentId(e.getParent().getId());
            dto.setParentNom(e.getParent().getNom());
            dto.setParentPrenom(e.getParent().getPrenom());
            dto.setParentTelephone(e.getParent().getTelephone());
            dto.setParentEmail(e.getParent().getEmail());
            dto.setParentAdresse(e.getParent().getAdresse());
            dto.setParentProfession(e.getParent().getProfession());
        }

        return dto;
    }



    public ParentDTO toParentDTO(Parent parent) {
        ParentDTO dto = new ParentDTO();
        dto.setId(parent.getId());
        dto.setNom(parent.getNom());
        dto.setPrenom(parent.getPrenom());
        dto.setTelephone(parent.getTelephone());
        dto.setEmail(parent.getEmail());
        dto.setAdresse(parent.getAdresse());
        dto.setProfession(parent.getProfession());
        if (parent.getEleves() != null) {
            dto.setNomsEleves(parent.getEleves().stream()
                    .map(e -> e.getNom() + " " + e.getPrenom())
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public PaiementDTO toPaiementDTO(Paiement p) {
        PaiementDTO dto = new PaiementDTO();
        dto.setId(p.getId());
        dto.setNumeroRecu(p.getNumeroRecu());
        dto.setMontant(p.getMontant());
        dto.setDatePaiement(p.getDatePaiement());
        dto.setMotif(p.getMotif());
        dto.setTypePaiement(p.getTypePaiement());
        dto.setStatut(p.getStatut());
        if (p.getEleve() != null) {
            dto.setEleveNom(p.getEleve().getNom());
            dto.setElevePrenom(p.getEleve().getPrenom());
        }
        if (p.getMois() != null) dto.setMoisLibelle(p.getMois().getLibelle());
        if (p.getAnnee() != null) dto.setAnneeLibelle(p.getAnnee().getLibelle());
        if (p.getEnregistrePar() != null) {
            dto.setEnregistreParNom(p.getEnregistrePar().getNom()
                    + " " + p.getEnregistrePar().getPrenom());
        }
        return dto;
    }

    public InscriptionDTO toInscriptionDTO(Inscription i) {
        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(i.getId());
        dto.setDateInscription(i.getDateInscription());
        dto.setFraisInscription(i.getFraisInscription());
        if (i.getEleve() != null) {
            dto.setEleveNom(i.getEleve().getNom());
            dto.setElevePrenom(i.getEleve().getPrenom());
        }
        if (i.getAnnee() != null) dto.setAnneeLibelle(i.getAnnee().getLibelle());
        if (i.getClasse() != null) dto.setClasseNiveau(i.getClasse().getNiveau().name());
        return dto;
    }

    public DepenseDTO toDepenseDTO(Depense d) {
        DepenseDTO dto = new DepenseDTO();
        dto.setId(d.getId());
        dto.setDescription(d.getDescription());
        dto.setTypeDepense(d.getTypeDepense());
        dto.setMontant(d.getMontant());
        dto.setDateDepense(d.getDateDepense());
        if (d.getAnnee() != null) dto.setAnneeLibelle(d.getAnnee().getLibelle());
        if (d.getMois() != null) dto.setMoisLibelle(d.getMois().getLibelle());
        if (d.getEnregistrePar() != null) {
            dto.setEnregistreParNom(d.getEnregistrePar().getNom()
                    + " " + d.getEnregistrePar().getPrenom());
        }
        return dto;
    }
}