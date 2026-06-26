package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.UserProfileDto;
import com.openclassrooms.mddapi.service.UserService;
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
public class MeController {

    private final UserService userService;

    /**
     * Profil de l'utilisateur connecté (infos + abonnements).
     *
     * @param principal utilisateur authentifié
     * @return 200 avec le profil
     */
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
    @PutMapping
    public ResponseEntity<UserProfileDto> updateMe(@Valid @RequestBody UpdateProfileRequest request,
                                                   Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }
}