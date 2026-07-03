package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.CreatePostRequest;
import com.openclassrooms.mddapi.dto.ErrorResponse;
import com.openclassrooms.mddapi.dto.PostDetailDto;
import com.openclassrooms.mddapi.dto.PostDto;
import com.openclassrooms.mddapi.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Articles", description = "Création et consultation des articles")
public class PostController {

    private final PostService postService;

    /**
     * Crée un article pour l'utilisateur courant.
     *
     * @param request   données de l'article (validées)
     * @param principal utilisateur authentifié (défini comme auteur)
     * @return 201 Created avec l'article créé
     */
    @Operation(summary = "Création d'un article (réservée aux abonnés du sujet visé)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Article créé"),
            @ApiResponse(responseCode = "400", description = "Données de l'article invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Utilisateur non abonné au sujet visé",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Sujet introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
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
    @Operation(summary = "Détail d'un article avec ses commentaires")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Détail de l'article"),
            @ApiResponse(responseCode = "404", description = "Article introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<PostDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostDetail(id));
    }
}