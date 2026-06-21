package com.openclassrooms.mddapi.exception;

import com.openclassrooms.mddapi.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestion centralisée des exceptions de l'API : chaque cas porte le code HTTP
 * sémantiquement correct, sans fuite d'information interne sur le 500.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Conflit d'unicité (e-mail / nom d'utilisateur déjà pris) → 409. */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ex.getMessage()));
    }

    /**
     * Échec d'authentification (identifiant inconnu ou mot de passe erroné) → 401.
     * Message volontairement indifférencié pour ne pas révéler l'existence d'un
     * compte (anti-énumération).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Identifiant ou mot de passe incorrect"));
    }

    /** Échec de validation d'un payload (@Valid) → 400, avec le détail par champ. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("Données invalides", errors));
    }

    /**
     * Filet de sécurité pour toute exception non gérée → 500. On logge le détail
     * côté serveur mais on ne l'expose jamais au client (pas de fuite d'info).
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(RuntimeException ex) {
        log.error("Erreur interne non gérée", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Une erreur interne est survenue"));
    }
}