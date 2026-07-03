package com.openclassrooms.mddapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration OpenAPI : métadonnées de l'API, schéma de sécurité JWT et
 * réponses d'erreur transverses.
 *
 * Déclare un schéma HTTP « bearer » appliqué globalement : toutes les opérations
 * apparaissent protégées (bouton Authorize dans Swagger UI), sauf les endpoints
 * d'authentification qui lèvent l'exigence via {@code @SecurityRequirements}. La
 * spec reflète ainsi la chaîne Spring Security (tout authentifié sauf /api/auth).
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

    /**
     * Ajoute les réponses d'erreur transverses (401, 500) à toutes les opérations.
     *
     * Ces deux codes découlent de comportements globaux du back : le 401 de la
     * chaîne de sécurité (route protégée sans token valide) et le 500 du filet
     * générique du {@code GlobalExceptionHandler}. Les déclarer ici, une seule
     * fois, évite de les répéter sur chaque endpoint et garantit leur cohérence.
     * Les codes spécifiques (400, 403, 404, 409) restent déclarés par endpoint,
     * là où ils se produisent réellement.
     */
    @Bean
    public OpenApiCustomizer globalErrorResponsesCustomizer() {
        return openApi -> openApi.getPaths().values().forEach(pathItem ->
                pathItem.readOperations().forEach(operation -> {
                    ApiResponses responses = operation.getResponses();
                    responses.addApiResponse("401", errorResponse("Non authentifié : token absent ou invalide"));
                    responses.addApiResponse("500", errorResponse("Erreur interne du serveur"));
                }));
    }

    /** Fabrique une réponse d'erreur documentée pointant sur le schéma ErrorResponse. */
    private ApiResponse errorResponse(String description) {
        return new ApiResponse()
                .description(description)
                .content(new Content().addMediaType("application/json",
                        new MediaType().schema(new Schema<>().$ref("#/components/schemas/ErrorResponse"))));
    }
}