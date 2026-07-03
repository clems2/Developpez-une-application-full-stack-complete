package com.openclassrooms.mddapi.security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration de sécurité : API REST stateless protégée par JWT.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Chaîne de sécurité stateless.
     * CSRF désactivé (pas de cookie de session), sessions STATELESS. Sont ouverts sans token :
     * les endpoints d'authentification (/api/auth/**) et la documentation OpenAPI/Swagger UI
     * (/v3/api-docs/**, /swagger-ui/**) ; tout le reste exige un token valide. Le filtre JWT
     * (bean Spring injecté) s'exécute avant le filtre d'authentification par formulaire. Une requête
     * non authentifiée sur une route protégée est rejetée en 401 via JwtAuthenticationEntryPoint.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint authenticationEntryPoint) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Neutralise l'enregistrement automatique du filtre JWT dans la chaîne de
     * filtres du conteneur servlet.
     *
     * Comme JwtAuthenticationFilter est un @Component, Spring
     * Boot l'ajouterait par défaut à la chaîne servlet globale en plus
     * de la chaîne de sécurité, d'où une double exécution. On désactive cet
     * enregistrement : le filtre ne vit que dans la SecurityFilterChain.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    /** Encodeur de mot de passe BCrypt (force par défaut, 10). */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Expose l'AuthenticationManager de Spring pour la connexion par
     * identifiant/mot de passe utilisé par le service d'authentification.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}