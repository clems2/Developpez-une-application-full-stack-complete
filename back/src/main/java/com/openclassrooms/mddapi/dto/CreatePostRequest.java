package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Données de création d'un article. L'auteur et la date ne sont pas fournis :
 * ils sont déterminés côté serveur.
 */
public record CreatePostRequest(

        @NotNull(message = "Le sujet est obligatoire")
        Long topicId,

        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 100, message = "Le titre ne peut excéder 100 caractères")
        String title,

        @NotBlank(message = "Le contenu est obligatoire")
        @Size(max = 65535, message = "Le contenu est trop long")
        String content

) {
}