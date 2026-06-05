package com.example.GestionScolaire.Model;

import com.example.GestionScolaire.Enum.Sexe;
import com.example.GestionScolaire.Enum.StatutEleve;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;

@Entity
@Table(name="eleves")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Eleve {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private String matricule;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(name = "nom_arabe", length = 100)
    private String nomArabe;

    @Column(name = "prenom_arabe", length = 100)
    private String prenomArabe;

    private LocalDate dateNaissance;


    @Enumerated(EnumType.STRING)
    private Sexe sexe;

    private String adresse;

    private String photoUrl;

    @Enumerated(EnumType.STRING)
    private StatutEleve statut;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Parent parent;
}
