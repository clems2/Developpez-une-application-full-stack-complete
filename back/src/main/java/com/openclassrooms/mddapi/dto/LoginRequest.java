package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Données de connexion : un identifiant (e-mail ou nom d'utilisateur) et un mot de passe.
 */
public record LoginRequest(

        @NotBlank(message = "L'identifiant est obligatoire")
        String identifier,

        @NotBlank(message = "Le mot de passe est obligatoire")
        String password
) {
}