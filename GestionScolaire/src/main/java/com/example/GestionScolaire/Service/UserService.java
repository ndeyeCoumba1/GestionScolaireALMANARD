package com.example.GestionScolaire.Service;

import com.example.GestionScolaire.Enum.Role;
import com.example.GestionScolaire.Exception.AppException;
import com.example.GestionScolaire.Model.User;
import com.example.GestionScolaire.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> findByRoleAndActif(Role role) {
        return userRepository.findByRoleAndActifTrue(role);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Utilisateur introuvable : " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("Utilisateur introuvable : " + email));
    }

    @Transactional
    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw AppException.conflict("Email déjà utilisé : " + user.getEmail());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    public User update(Long id, User updated) {
        User user = findById(id);
        user.setNom(updated.getNom());
        user.setPrenom(updated.getPrenom());
        user.setNomArabe(updated.getNomArabe());
        user.setPrenomArabe(updated.getPrenomArabe());
        user.setEmail(updated.getEmail());
        user.setRole(updated.getRole());
        return userRepository.save(user);
    }

    @Transactional
    public User updateNomArabe(Long id, String nomArabe, String prenomArabe) {
        User user = findById(id);
        user.setNomArabe(nomArabe);
        user.setPrenomArabe(prenomArabe);
        return userRepository.save(user);
    }

    @Transactional
    public void changerMotDePasse(Long id, String nouveauMotDePasse) {
        User user = findById(id);
        user.setPassword(passwordEncoder.encode(nouveauMotDePasse));
        userRepository.save(user);
    }

    @Transactional
    public void desactiver(Long id) {
        User user = findById(id);
        user.setActif(false);
        userRepository.save(user);
    }

    @Transactional
    public void reactiver(Long id) {
        User user = findById(id);
        user.setActif(true);
        userRepository.save(user);
    }
}