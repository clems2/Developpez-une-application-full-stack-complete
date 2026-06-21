package com.openclassrooms.mddapi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Génération et validation des JWT (signature HMAC-SHA256).
 *
 * Le sujet sub porte le nom d'utilisateur. Un
 * changement de username ou d'e-mail rend le token caduc au prochain appel, comportement
 * acceptable et voulu pour un MVP interne. Un changement de mot de passe, lui,
 * ne révoque pas un JWT stateless : compromis MVP assumé (pas de mécanisme de révocation).
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Génère un token signé pour l'utilisateur donné.
     *
     * @param username nom d'utilisateur authentifié (porté par le sujet)
     * @return le JWT compact signé
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Valide la signature et l'expiration du token, puis extrait le nom
     * d'utilisateur porté par le sujet.
     *
     * @param token le JWT reçu (sans le préfixe {@code Bearer})
     * @return le nom d'utilisateur
     * @throws io.jsonwebtoken.JwtException si le token est invalide ou expiré
     */
    public String extractUsername(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}