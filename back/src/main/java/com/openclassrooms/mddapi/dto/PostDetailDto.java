package com.openclassrooms.mddapi.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Projection lecture du détail d'un article, commentaires inclus. Distincte de
 * PostDto (feed/liste) qui reste épurée et ne porte pas de commentaires.
 * author = username, topic = title (champs plats, décision D1 Post).
 */
public record PostDetailDto(
        Long id,
        String title,
        String content,
        String author,
        LocalDateTime createdAt,
        String topic,
        List<CommentDto> comments
) {
}