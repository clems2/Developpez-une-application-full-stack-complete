package com.openclassrooms.mddapi.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests unitaires de {@link JwtUtil} : génération, relecture, et rejet des tokens
 * invalides ou expirés. Aucun contexte Spring — la classe est instanciée directement
 * avec un secret et une durée de vie choisis par test.
 */
class JwtUtilTest {

    /** Secret de test suffisamment long pour HMAC-SHA256 (>= 32 octets). */
    private static final String SECRET =
            "test-secret-key-for-junit-only-do-not-use-in-prod-0123456789";

    /** Aller-retour nominal : un token généré se relit et rend le username du sujet. */
    @Test
    void generateThenExtract_shouldReturnTheSubjectUsername() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 3_600_000L); // 1 h

        String token = jwtUtil.generateToken("alice");

        assertThat(jwtUtil.extractUsername(token)).isEqualTo("alice");
    }

    /** Un token expiré (durée de vie négative) est rejeté par la validation. */
    @Test
    void extractUsername_shouldThrow_whenTokenExpired() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, -1_000L); // déjà expiré à l'émission

        String expired = jwtUtil.generateToken("alice");

        assertThatThrownBy(() -> jwtUtil.extractUsername(expired))
                .isInstanceOf(JwtException.class);
    }

    /** Une chaîne qui n'est pas un JWT est rejetée. */
    @Test
    void extractUsername_shouldThrow_whenTokenMalformed() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 3_600_000L);

        assertThatThrownBy(() -> jwtUtil.extractUsername("pas-un-vrai-jwt"))
                .isInstanceOf(JwtException.class);
    }

    /** Un token signé avec un autre secret est rejeté (signature invalide). */
    @Test
    void extractUsername_shouldThrow_whenSignatureFromAnotherKey() {
        JwtUtil issuer = new JwtUtil("another-secret-key-different-from-the-first-0123456789", 3_600_000L);
        JwtUtil verifier = new JwtUtil(SECRET, 3_600_000L);

        String foreignToken = issuer.generateToken("alice");

        assertThatThrownBy(() -> verifier.extractUsername(foreignToken))
                .isInstanceOf(JwtException.class);
    }
}