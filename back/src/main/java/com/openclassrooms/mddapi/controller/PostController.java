package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.CreatePostRequest;
import com.openclassrooms.mddapi.dto.PostDetailDto;
import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Endpoints des articles.
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * Crée un article pour l'utilisateur courant.
     *
     * @param request   données de l'article (validées)
     * @param principal utilisateur authentifié (défini comme auteur)
     * @return 201 Created avec l'article créé
     */
    @PostMapping
    public ResponseEntity<PostDto> create(@Valid @RequestBody CreatePostRequest request,
                                          Principal principal) {
        PostDto created = postService.create(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Détail d'un article avec ses commentaires.
     *
     * @param id identifiant de l'article
     * @return 200 avec le détail de l'article
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostDetail(id));
    }
}