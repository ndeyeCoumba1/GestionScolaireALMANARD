package com.example.GestionScolaire.Model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mois")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Mois {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String libelle;
    private Double montantScolarite;
}
