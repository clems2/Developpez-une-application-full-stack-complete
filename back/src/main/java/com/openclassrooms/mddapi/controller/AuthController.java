package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.AuthResponse;
import com.openclassrooms.mddapi.dto.LoginRequest;
import com.openclassrooms.mddapi.dto.RegisterRequest;
import com.openclassrooms.mddapi.service.AuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
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
public class AuthController {

    private final AuthService authService;

    /**
     * Inscrit un nouvel utilisateur.
     *
     * @param request données d'inscription (validées)
     * @return 201 Created avec le token de la session naissante
     */
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
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}