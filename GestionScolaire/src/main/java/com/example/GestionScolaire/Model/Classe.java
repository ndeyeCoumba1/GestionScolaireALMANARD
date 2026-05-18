package com.example.GestionScolaire.Model;

import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Enum.StatutEleve;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name= "classes")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Classe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    private NiveauClasse niveau;

    private Integer capaciteMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private StatutEleve statut;

    @OneToMany(mappedBy = "classe" , cascade = CascadeType.ALL)
    private List<Eleve> eleves;

    @ManyToOne
    private User enseignant;

}
