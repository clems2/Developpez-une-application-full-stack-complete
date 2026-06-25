package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.CommentDto;
import com.openclassrooms.mddapi.dto.CreateCommentRequest;
import com.openclassrooms.mddapi.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Endpoints d'écriture des commentaires (sous-ressource d'un article).
 */
@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * Ajoute un commentaire à un article. L'auteur provient du token, la date est
     * posée serveur.
     *
     * @param postId    article commenté
     * @param request   contenu du commentaire (validé)
     * @param principal utilisateur authentifié
     * @return 201 avec le commentaire créé
     */
    @PostMapping
    public ResponseEntity<CommentDto> create(@PathVariable Long postId,
                                             @Valid @RequestBody CreateCommentRequest request,
                                             Principal principal) {
        CommentDto created = commentService.create(postId, principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}