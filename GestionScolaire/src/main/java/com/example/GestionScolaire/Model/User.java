package com.example.GestionScolaire.Model;

import com.example.GestionScolaire.Enum.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(name = "nom_arabe", length = 100)
    private String nomArabe;

    @Column(name = "prenom_arabe", length = 100)
    private String prenomArabe;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column( nullable = false)
    private Boolean actif = true;


}
