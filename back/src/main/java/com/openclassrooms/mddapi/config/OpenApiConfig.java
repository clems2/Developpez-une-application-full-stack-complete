package com.openclassrooms.mddapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration OpenAPI : métadonnées de l'API et schéma de sécurité JWT.
 *
 * Déclare un schéma HTTP « bearer » et l'applique globalement : toutes les
 * opérations apparaissent protégées (bouton Authorize dans Swagger UI). Les
 * endpoints publics d'authentification lèvent cette exigence localement via
 * {@code @SecurityRequirements} (vide) sur leur contrôleur. La spec reflète
 * ainsi fidèlement la chaîne Spring Security (tout authentifié sauf /api/auth).
 */
@Configuration
public class OpenApiConfig {

    /** Nom logique du schéma de sécurité, référencé par les contrôleurs protégés. */
    public static final String SECURITY_SCHEME_NAME = "bearer-jwt";

    /** Construit la définition OpenAPI (infos + sécurité JWT globale). */
    @Bean
    public OpenAPI mddOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MDD API")
                        .description("API REST du réseau social MDD (Monde de Dév)")
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT obtenu via /api/auth/login ou /api/auth/register")));
    }
}