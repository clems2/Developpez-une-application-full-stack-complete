package com.openclassrooms.mddapi.dto;

/**
 * Réponse d'authentification : le JWT à placer dans l'en-tête Authorization.
 */
public record AuthResponse(String token) {
}