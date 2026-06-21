package com.openclassrooms.mddapi.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Point d'entrée déclenché lorsqu'une requête non authentifiée atteint une route
 * protégée.
 *
 * Renvoie un 401 Unauthorized (et non le 403 par défaut de
 * Spring Security en l'absence de mécanisme d'authentification interactif), afin
 * que « non authentifié / token absent ou invalide » porte le code HTTP correct.
 * Le front s'appuie sur ce 401 pour purger la session et rediriger vers la
 * connexion.</p>
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentification requise");
    }
}