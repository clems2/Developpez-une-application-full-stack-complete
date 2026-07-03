package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.ErrorResponse;
import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.UserProfileDto;
import com.openclassrooms.mddapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

/**
 * Profil de l'utilisateur authentifié (consultation et mise à jour).
 */
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
@Tag(name = "Profil", description = "Consultation et mise à jour du profil de l'utilisateur connecté")
public class MeController {

    private final UserService userService;

    /**
     * Profil de l'utilisateur connecté (infos + abonnements).
     *
     * @param principal utilisateur authentifié
     * @return 200 avec le profil
     */
    @Operation(summary = "Profil de l'utilisateur connecté (infos + abonnements)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profil de l'utilisateur"),
            @ApiResponse(responseCode = "404", description = "Utilisateur introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<UserProfileDto> getMe(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    /**
     * Met à jour le profil. Renvoie 200 + le profil à jour, sans nouveau token :
     * un changement de username invalide naturellement le token courant (sub = username) ;
     * la reconnexion uniforme après modification est gérée côté front (stateless assumé).
     *
     * @param request   nouvelles valeurs (password optionnel)
     * @param principal utilisateur authentifié
     * @return 200 avec le profil mis à jour
     */
    @Operation(summary = "Mise à jour du profil (mot de passe optionnel)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profil mis à jour"),
            @ApiResponse(responseCode = "400", description = "Données invalides (dont mot de passe non conforme à la règle)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Nom d'utilisateur ou e-mail déjà utilisé par un autre compte",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping
    public ResponseEntity<UserProfileDto> updateMe(@Valid @RequestBody UpdateProfileRequest request,
                                                   Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }
}