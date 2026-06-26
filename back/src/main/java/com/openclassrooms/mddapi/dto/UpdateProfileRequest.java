package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Corps de mise à jour du profil. username et email sont toujours
 * fournis (le front les pré-remplit depuis le profil courant). password est
 * optionnel : le front ne peut pas pré-remplir un mot de passe (seul un hash
 * est stocké), donc un champ vide/absent signifie « inchangé ». S'il est présent et
 * non vide, il est validé contre PasswordPolicy
 * côté service (et non ici, car une annotation rejetterait aussi le cas « vide = inchangé »).
 */
public record UpdateProfileRequest(
        @NotBlank String username,
        @NotBlank @Email String email,
        String password
) {
}