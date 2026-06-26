package com.openclassrooms.mddapi.exception;

/** Requête invalide (ex. mot de passe ne respectant pas la règle de complexité) → 400. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}