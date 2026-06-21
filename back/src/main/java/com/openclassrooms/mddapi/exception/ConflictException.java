package com.openclassrooms.mddapi.exception;

/**
 * Levée lorsqu'une ressource entre en conflit avec une contrainte d'unicité
 * (ex. inscription avec un e-mail ou un nom d'utilisateur déjà pris). Mappée en
 * HTTP 409 Conflict par le GlobalExceptionHandler.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}