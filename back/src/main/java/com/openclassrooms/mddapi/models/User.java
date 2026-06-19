package com.openclassrooms.mddapi.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Compte utilisateur du réseau MDD.
 *
 * Les champs username et email sont uniques (contraintes portées également par la migration Flyway V2).
 * Le mot de passe est stocké hashé (BCrypt) et encodage délégué au service d'authentification.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    /**
     * Construit un utilisateur à partir de ses seuls champs métier.
     * L'id est volontairement absent : il est généré par la base, jamais fourni par l'appelant.
     *
     * @param username nom d'utilisateur unique
     * @param email    adresse e-mail unique
     * @param password mot de passe déjà hashé
     */
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}