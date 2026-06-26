package com.openclassrooms.mddapi.dto;

import com.openclassrooms.mddapi.security.PasswordPolicy;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Données d'inscription d'un nouvel utilisateur.
 *
 * Le mot de passe respecte la règle de la spec : au moins 8 caractères, avec
 * au minimum une minuscule, une majuscule, un chiffre et un caractère spécial.
 */
public record RegisterRequest(

        @NotBlank(message = "Le nom d'utilisateur est obligatoire")
        @Size(max = 50, message = "Le nom d'utilisateur ne peut excéder 50 caractères")
        String username,

        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(message = "Format d'e-mail invalide")
        @Size(max = 255, message = "L'e-mail ne peut excéder 255 caractères")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Pattern(
                regexp = PasswordPolicy.REGEX,
                message = PasswordPolicy.MESSAGE)
        String password

) {
}