package com.openclassrooms.mddapi.security;

import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * Filtre d'authentification JWT exécuté une fois par requête.
 *
 * En l'absence de token, si le token est invalide / expiré, ou si le username ne résout plus aucun compte
 * (pseudo modifié), la requête poursuit la chaîne en restant anonyme : la configuration statuera ensuite (401 via l'entry point sur route protégée)
 *
 * Annoté @Component (géré par Spring) ; son double enregistrement servlet est neutralisé dans SecurityConfig pour qu'il ne s'exécute que
 * dans la chaîne de sécurité.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            authenticate(token, request);
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Authentifie la requête à partir du token : résout l'utilisateur par son
     * nom d'utilisateur (sujet) et alimente le contexte. Toute erreur de
     * validation, ou un username qui ne résout plus, laisse la requête anonyme.
     */
    private void authenticate(String token, HttpServletRequest request) {
        try {
            String username = jwtUtil.extractUsername(token);
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getUsername(), null, AuthorityUtils.NO_AUTHORITIES);
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtException ex) {
            // Token invalide ou expiré : requête anonyme.
            SecurityContextHolder.clearContext();
        }
    }

    /** Extrait le token brut de l'en-tête Authorization, ou null s'il est absent. */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(AUTH_HEADER);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}