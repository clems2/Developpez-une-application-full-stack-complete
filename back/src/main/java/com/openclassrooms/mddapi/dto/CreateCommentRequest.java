package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corps de création d'un commentaire. L'auteur et la date sont posés serveur,
 * jamais fournis par le client : seul {@code content} est attendu.
 */
public record CreateCommentRequest(
        @NotBlank @Size(max = 1000) String content
) {
}