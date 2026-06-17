package com.openclassrooms.mddapi.dto;

/**
 * Représentation d'un sujet exposée et envoyé par l'API.
 */
public record TopicDto(Long id, String title, String description) {
//TODO Le champ subscribed (l'utilisateur courant est-il abonné ?) sera ajouté avec l'authentification, car il dépend de l'utilisateur connecté.
}