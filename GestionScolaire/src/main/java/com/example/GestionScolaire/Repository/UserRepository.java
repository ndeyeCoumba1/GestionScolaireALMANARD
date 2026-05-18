package com.example.GestionScolaire.Repository;


import com.example.GestionScolaire.Enum.NiveauClasse;
import com.example.GestionScolaire.Enum.Role;
import com.example.GestionScolaire.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Pour l'authentification
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Lister les utilisateurs par rôle (ex: tous les enseignants)
    List<User> findByRole(Role role);

    // Lister les utilisateurs actifs
    List<User> findByActifTrue();

    // Lister les utilisateurs actifs par rôle
    List<User> findByRoleAndActifTrue(Role role);
}
