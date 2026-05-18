package com.example.GestionScolaire.Model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "etablissements")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Etablissement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private  String nom;

    private String adresse;

    @Column(unique = true)
    private String telephone;

    @Column(unique = true)
    private String email;

    private String logoUrl;
}
