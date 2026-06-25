package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

/**
 * Lecture du fil d'actualité de l'utilisateur authentifié.
 */
@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final PostService postService;

    /**
     * Retourne le fil de l'utilisateur connecté (articles de ses abonnements).
     * Fil vide si aucun abonnement (liste vide, 200).
     *
     * @param order     sens de tri par date, "asc" ou "desc" (défaut)
     * @param principal utilisateur authentifié
     * @return 200 avec la liste des articles triée
     */
    @GetMapping
    public ResponseEntity<List<PostDto>> getFeed(
            @RequestParam(defaultValue = "desc") String order,
            Principal principal) {
        return ResponseEntity.ok(postService.getFeed(principal.getName(), order));
    }
}