package com.openclassrooms.mddapi.exception;

/**
 * Levée lorsqu'un utilisateur tente une action réservée aux abonnés d'un sujet
 * (publier un article) sans y être abonné. Mappée en HTTP 403.
 */
public class SubscriptionRequiredException extends RuntimeException {
    public SubscriptionRequiredException(String message) {
        super(message);
    }
}