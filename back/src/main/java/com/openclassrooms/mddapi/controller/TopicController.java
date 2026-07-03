package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.ErrorResponse;
import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.service.SubscriptionService;
import com.openclassrooms.mddapi.service.TopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;
import java.util.List;

/**
 * Endpoints REST des Topic. Logique métier déléguée au Service.
 */
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@Tag(name = "Sujets", description = "Liste des sujets et gestion des abonnements")
public class TopicController {

    private final TopicService topicService;
    private final SubscriptionService subscriptionService;

    /**
     * Liste tous les sujets avec, pour chacun, l'état d'abonnement de l'utilisateur courant.
     *
     * @param principal utilisateur authentifié
     * @return la liste des sujets
     */
    @Operation(summary = "Liste des sujets avec l'état d'abonnement de l'utilisateur courant")
    @ApiResponse(responseCode = "200", description = "Liste des sujets")
    @GetMapping
    public ResponseEntity<List<TopicDto>> getAllTopics(Principal principal) {
        return ResponseEntity.ok(topicService.getAllTopics(principal.getName()));
    }

    /**
     * Abonne l'utilisateur courant au sujet. Idempotent.
     *
     * @param id        identifiant du sujet
     * @param principal utilisateur authentifié
     * @return 200 OK
     */
    @Operation(summary = "Abonnement à un sujet (idempotent)")
    @ApiResponse(responseCode = "200", description = "Abonnement effectué (ou déjà existant)")
    @ApiResponse(responseCode = "404", description = "Sujet introuvable",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<Void> subscribe(@PathVariable Long id, Principal principal) {
        subscriptionService.subscribe(principal.getName(), id);
        return ResponseEntity.ok().build();
    }

    /**
     * Désabonne l'utilisateur courant du sujet. Idempotent.
     *
     * @param id        identifiant du sujet
     * @param principal utilisateur authentifié
     * @return 200 OK
     */
    @Operation(summary = "Désabonnement d'un sujet (idempotent)")
    @ApiResponse(responseCode = "200", description = "Désabonnement effectué (ou déjà absent)")
    @ApiResponse(responseCode = "404", description = "Sujet introuvable",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<Void> unsubscribe(@PathVariable Long id, Principal principal) {
        subscriptionService.unsubscribe(principal.getName(), id);
        return ResponseEntity.ok().build();
    }
}