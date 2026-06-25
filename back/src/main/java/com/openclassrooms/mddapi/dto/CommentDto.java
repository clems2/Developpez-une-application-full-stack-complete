package com.openclassrooms.mddapi.dto;

import java.time.LocalDateTime;

/**
 * Projection lecture d'un commentaire. author = username (pas l'entité).
 */
public record CommentDto(Long id, String content, String author, LocalDateTime createdAt) {
}