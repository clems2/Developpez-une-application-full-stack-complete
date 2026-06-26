package com.openclassrooms.mddapi.security;

/**
 * Règle de validité d'un mot de passe (spec MDD) : au moins 8 caractères, dont
 * un chiffre, une minuscule, une majuscule et un caractère spécial. Constante
 * partagée entre l'inscription et la mise à jour de profil pour éviter toute
 * divergence de règle.
 */
public final class PasswordPolicy {

    /** Regex de validation (référençable depuis une annotation @Pattern). */
    public static final String REGEX =
            "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$";

    /** Message d'erreur associé, réutilisé partout où la règle est appliquée. */
    public static final String MESSAGE =
            "Le mot de passe doit contenir au moins 8 caractères, "
            + "dont une minuscule, une majuscule, un chiffre et un caractère spécial.";

    private PasswordPolicy() {
    }
}