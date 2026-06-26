package com.openclassrooms.mddapi.dto;

import java.util.List;

/**
 * Profil de l'utilisateur connecté : ses informations et ses abonnements (les
 * sujets auxquels il est abonné, exposés en TopicDto avec subscribed=true).
 */
public record UserProfileDto(
        Long id,
        String username,
        String email,
        List<TopicDto> subscriptions
) {
}