package com.openclassrooms.mddapi.dto;

/**
 * Représentation d'un sujet exposée par l'API.
 *
 * Le champ subscribed indique si l'utilisateur courantest abonné à ce sujet.
 * Étant par-utilisateur, il n'est pas issu de l'entité Topic : il est calculé et injecté
 * par le service (le mapper, qui ne connaît pas l'utilisateur courant, ne le renseigne pas).
 */
public record TopicDto(Long id, String title, String description, boolean subscribed) {
}