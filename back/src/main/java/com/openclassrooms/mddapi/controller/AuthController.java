package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.AuthResponse;
import com.openclassrooms.mddapi.dto.ErrorResponse;
import com.openclassrooms.mddapi.dto.LoginRequest;
import com.openclassrooms.mddapi.dto.RegisterRequest;
import com.openclassrooms.mddapi.service.AuthService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints publics d'authentification (inscription, connexion).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SecurityRequirements   // routes publiques : annule l'exigence de sécurité globale dans la doc OpenAPI
@Tag(name = "Authentification", description = "Inscription et connexion (endpoints publics)")
public class AuthController {

    private final AuthService authService;

    /**
     * Inscrit un nouvel utilisateur.
     *
     * @param request données d'inscription (validées)
     * @return 201 Created avec le token de la session naissante
     */
    @Operation(summary = "Inscription d'un nouvel utilisateur (auto-login)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Utilisateur créé, token retourné"),
            @ApiResponse(responseCode = "400", description = "Données d'inscription invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-mail ou nom d'utilisateur déjà utilisé",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /**
     * Connecte un utilisateur par e-mail ou nom d'utilisateur.
     *
     * @param request identifiant + mot de passe (validés)
     * @return 200 OK avec le token JWT
     */
    @Operation(summary = "Connexion par e-mail ou nom d'utilisateur")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentifié, token retourné"),
            @ApiResponse(responseCode = "400", description = "Requête invalide",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Identifiant ou mot de passe incorrect",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}