package com.example.GestionScolaire.DTO;


import com.example.GestionScolaire.Enum.Role;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
    private Boolean actif;

}
