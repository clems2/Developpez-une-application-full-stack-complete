package com.openclassrooms.mddapi.exception;

/**
 * Levée lorsqu'une ressource demandée n'existe pas (ex. abonnement à un sujet
 * dont l'identifiant est inconnu). Mappée en HTTP 404 Not Found par le
 * gestionnaire d'exceptions.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}