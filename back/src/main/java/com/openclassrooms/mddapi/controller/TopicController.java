package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.openclassrooms.mddapi.service.SubscriptionService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import java.security.Principal;
import java.util.List;

/**
 * Endpoints REST des Topic. Logique métier déléguée au Service.
 */
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final SubscriptionService subscriptionService;
    
    /**
     * Liste tous les sujets avec, pour chacun, l'état d'abonnement de l'utilisateur courant.
     *
     * @param principal utilisateur authentifié
     * @return la liste des sujets
     */
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
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<Void> unsubscribe(@PathVariable Long id, Principal principal) {
        subscriptionService.unsubscribe(principal.getName(), id);
        return ResponseEntity.ok().build();
    }
}