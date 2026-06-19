package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Accès aux données des utilisateurs.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** Recherche un utilisateur par son adresse e-mail. */
    Optional<User> findByEmail(String email);

    /** Recherche un utilisateur par son nom d'utilisateur. */
    Optional<User> findByUsername(String username);

    /** Indique si un compte existe déjà pour cet e-mail. */
    boolean existsByEmail(String email);

    /** Indique si un compte existe déjà pour ce nom d'utilisateur. */
    boolean existsByUsername(String username);
}