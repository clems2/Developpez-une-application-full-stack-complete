package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Fil d'actualité", description = "Articles des sujets auxquels l'utilisateur est abonné")
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
    @Operation(summary = "Fil d'actualité trié par date (liste vide si aucun abonnement)")
    @ApiResponse(responseCode = "200", description = "Articles du fil, triés par date")
    @GetMapping
    public ResponseEntity<List<PostDto>> getFeed(
            @Parameter(description = "Sens de tri par date : \"asc\" ou \"desc\" (défaut)")
            @RequestParam(defaultValue = "desc") String order,
            Principal principal) {
        return ResponseEntity.ok(postService.getFeed(principal.getName(), order));
    }
}