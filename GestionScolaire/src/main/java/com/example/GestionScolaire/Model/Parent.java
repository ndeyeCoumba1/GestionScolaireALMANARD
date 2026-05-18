package com.example.GestionScolaire.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name="Parents")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Parent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String adresse;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String telephone;

    private String profession;

    @OneToMany(mappedBy = "parent")
    private List<Eleve> eleves;
}
