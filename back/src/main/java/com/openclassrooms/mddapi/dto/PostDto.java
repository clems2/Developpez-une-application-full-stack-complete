package com.openclassrooms.mddapi.dto;

import java.time.LocalDateTime;

/**
 * Représentation d'un article exposée par l'API.
 *
 * author porte le nom d'utilisateur de l'auteur et topic le
 * titre du sujet (forme plate : le MVP n'affiche que ces libellés). Les
 * commentaires seront ajoutés à ce DTO lors de la tranche Comment.
 */
public record PostDto(
        Long id,
        String title,
        String content,
        String author,
        LocalDateTime createdAt,
        String topic
) {
}