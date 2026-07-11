package com.openclassrooms.mddapi.security;

import com.openclassrooms.mddapi.models.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de {@link JwtAuthenticationFilter}. Le filtre est isolé : {@link JwtUtil}
 * et {@link UserRepository} sont mockés, la requête et la réponse sont des mocks servlet.
 * On vérifie que le contexte de sécurité est peuplé UNIQUEMENT dans le cas nominal, et
 * laissé anonyme dans tous les cas d'échec — chaque test cible une branche du filtre.
 *
 * La chaîne de filtres ({@link FilterChain}) doit toujours être poursuivie : un filtre
 * d'authentification ne bloque pas lui-même, il délègue la décision à la configuration.
 */
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtUtil, userRepository);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        // Le contexte est un ThreadLocal : on le nettoie pour ne pas polluer les tests suivants.
        SecurityContextHolder.clearContext();
    }

    /** En-tête Authorization absent : aucune authentification, jwtUtil jamais sollicité. */
    @Test
    void doFilter_shouldStayAnonymous_whenNoAuthorizationHeader() throws Exception {
        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil);
        verify(filterChain).doFilter(request, response);
    }

    /** En-tête présent mais sans préfixe « Bearer » : token non extrait, requête anonyme. */
    @Test
    void doFilter_shouldStayAnonymous_whenHeaderHasNoBearerPrefix() throws Exception {
        request.addHeader("Authorization", "Basic YWxpY2U6cHdk");

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil);
        verify(filterChain).doFilter(request, response);
    }

    /** Token valide + utilisateur résolu : le contexte est peuplé avec le username. */
    @Test
    void doFilter_shouldAuthenticate_whenTokenValidAndUserExists() throws Exception {
        request.addHeader("Authorization", "Bearer valid-token");
        when(jwtUtil.extractUsername("valid-token")).thenReturn("alice");
        User alice = new User();
        alice.setUsername("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        filter.doFilter(request, response, filterChain);

        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo("alice");
        verify(filterChain).doFilter(request, response);
    }

    /** Token valide mais username ne résout plus aucun compte : requête anonyme. */
    @Test
    void doFilter_shouldStayAnonymous_whenUserNoLongerExists() throws Exception {
        request.addHeader("Authorization", "Bearer valid-token");
        when(jwtUtil.extractUsername("valid-token")).thenReturn("ghost");
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    /** Token invalide/expiré : JwtException capturée, contexte nettoyé, requête anonyme. */
    @Test
    void doFilter_shouldStayAnonymous_whenTokenInvalid() throws Exception {
        request.addHeader("Authorization", "Bearer bad-token");
        when(jwtUtil.extractUsername("bad-token")).thenThrow(new JwtException("invalide"));

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userRepository, never()).findByUsername(any());
        verify(filterChain).doFilter(request, response);
    }

    /** Contexte déjà authentifié : le filtre ne ré-authentifie pas (jwtUtil non sollicité). */
    @Test
    void doFilter_shouldNotReauthenticate_whenContextAlreadySet() throws Exception {
        UsernamePasswordAuthenticationToken existing =
                new UsernamePasswordAuthenticationToken("bob", null, java.util.Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(existing);
        request.addHeader("Authorization", "Bearer valid-token");

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existing);
        verifyNoInteractions(jwtUtil);
        verify(filterChain).doFilter(request, response);
    }
}