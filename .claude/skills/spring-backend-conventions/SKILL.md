---
name: spring-backend-conventions
description: >
  Conventions back-end Spring Boot (Java) à appliquer pour ce projet : architecture
  Controller-Service-Repo, sécurité JWT, DTO/MapStruct, gestion centralisée des
  exceptions et sémantique HTTP. Utilise CETTE skill dès que tu crées ou refactores
  un controller, un service, un repository, une config de sécurité, un mapper, un DTO
  ou un handler d'exception Spring — même sans demande explicite d'appliquer les
  conventions. Couvre notamment le mapping correct des codes 401/403/404 et la
  séparation stricte des responsabilités.
---

# Conventions Back Spring Boot

Règles **conditionnelles** : règle par défaut + exceptions ("préfère X si Y").

Cible technique : **Spring Boot 3.x, Java 21, Spring Security 6, namespace `jakarta`**.

## 1. Architecture en couches

- **Controller → Service → Repository**, strictement.
- Les contrôleurs sont **fins** : ils délèguent au service et enveloppent dans un
  `ResponseEntity<Typé>`. **Aucune logique métier** dans un controller (pas de
  `if` métier, pas d'accès repo, pas de calcul).
- Toute la logique (validation métier, résolution d'entités, règles) vit dans le
  **service**. Le repository ne fait que de l'accès données.
- **Principes SOLID (nommés)** : cette architecture matérialise SOLID, et il faut
  pouvoir le nommer explicitement (revue technique, soutenance, Javadoc) :
  - **SRP** : controller fin / service à responsabilité unique / repository = accès
    données seul ;
  - **DIP** : on dépend d'abstractions, dépendances injectées par constructeur (§2) ;
  - **OCP / LSP / ISP** : interfaces de service ciblées, pas de "god service".

## 2. Injection de dépendances

- Injection **par constructeur** via `@RequiredArgsConstructor` (Lombok) + champs
  `private final`. Pas d'`@Autowired` sur champ.

## 3. DTO et MapStruct

- N'expose **jamais** une entité JPA dans l'API : DTO en entrée et en sortie.
- **Java 21 — préfère un `record`** pour un DTO sans logique :
  `public record ArticleDto(Long id, String title, String content, ...)`. Immuable,
  concis, compatible MapStruct. **Pas de Lombok `@Data`/`@Getter`** sur un
  DTO-record (redondant). Garde une **classe** seulement si le DTO porte de la
  logique ou des annotations incompatibles avec un record.
- Mappers MapStruct en `@Mapper(componentModel = "spring")`, `@Mapping` explicites
  pour les renommages, `@Mapping(target = ..., ignore = true)` sur les champs que le
  mapper ne doit pas remplir (id, audit, relations résolues côté service).
- Ne mets pas de logique métier dans le mapper : juste de la transformation.

## 4. Sémantique HTTP des exceptions (RÈGLE FERME)

Mappe le bon code, ne réutilise pas une exception "fourre-tout" :

| Situation                               | Exception                    | Code |
|-----------------------------------------|------------------------------|------|
| Ressource introuvable                   | `ResourceNotFoundException`  | 404  |
| Authentifié mais non autorisé (owner)   | exception 403 / `AccessDenied` | 403 |
| Non authentifié / token invalide        | `UnauthorizedException`      | 401  |
| Validation / paramètres invalides       | `BadRequestException`        | 400  |

- **Ne lève pas `UnauthorizedException` (401) pour un "not found"** : c'est 404.
  Une violation de propriété ("tu n'es pas le propriétaire") est **403**, pas 401.
- Centralise tout dans un `@ControllerAdvice` / `@RestControllerAdvice` unique.
- Pour le handler générique `RuntimeException` → 500 : **n'expose pas
  `ex.getMessage()`** dans le corps (fuite d'info interne). Renvoie un message
  générique et logge le détail côté serveur.
- Ne lève **jamais** un `RuntimeException` brut dans un service : crée/réutilise une
  exception métier ou technique dédiée.

## 5. Sécurité (JWT stateless)

- `SecurityFilterChain` en **DSL lambda Spring Security 6** (le style chaîné et
  `.and()` sont dépréciés/supprimés sous Boot 3 — n'écris plus
  `http.csrf().disable().sessionManagement()...`) :
  - `csrf(csrf -> csrf.disable())`,
  - `sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`,
  - `authorizeHttpRequests(auth -> auth.requestMatchers(...).permitAll()`
    `.anyRequest().authenticated())` — `permitAll` **ciblé** (auth, swagger,
    ressources statiques),
  - `addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`.
- Filtre JWT en `OncePerRequestFilter`.
- **Récupération de l'utilisateur courant** : préfère **injecter `Principal`** dans
  la signature du controller et passer `principal.getName()` au service, qui résout
  l'utilisateur. Évite de faire
  `(UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()`
  **dans le controller** (couplage du controller aux internes de Spring Security).
  Préfère la deuxième approche **seulement si** tu as besoin de l'objet `UserDetails`
  complet et de ses autorités au-delà du simple identifiant.

## 6. Validation

- `@Valid @RequestBody` sur les payloads ; `@Validated` au niveau classe + contraintes
  (`@Min`, etc.) sur les `@PathVariable` / `@RequestParam`.
- **Imports `jakarta.*` uniquement** (`jakarta.validation.*`, `jakarta.persistence.*`)
  — **jamais `javax.*`**. Piège de migration Boot 2→3 : un `javax.persistence.*`
  résiduel fait que l'entité n'est pas reconnue/scannée (incohérence ou crash au
  runtime). À vérifier en priorité après l'upgrade du repo legacy.

## 7. Stockage de fichiers et I/O

- *Hors périmètre MDD : le MVP ne gère aucun upload de fichier (articles,
  commentaires, sujets et abonnements sont du texte). Cette section ne s'applique
  que si un besoin d'I/O fichier apparaît plus tard.*
- Le cas échéant : **n'écris jamais dans `src/main/resources` à l'exécution** (chemin
  non inscriptible une fois packagé en jar), et isole le stockage dans un **composant
  dédié** (`StorageService` / `FileStorageService`), jamais directement dans un
  service métier.

## 8. Documentation et logs

- **Code (Javadoc) — exigence projet : toute méthode publique documentée.** Chaque
  méthode **publique** de controller, service et mapper porte une Javadoc, y compris
  courte. Documente le contrat (paramètres, retour, exceptions levées) et le
  *pourquoi* de la logique non triviale.
  - **Règle de concision pour le trivial** (accesseurs, délégation directe sans
    logique) : une **seule ligne** de description suffit, **sans `@param`/`@return`**
    s'ils n'apportent aucune valeur. Le bloc Javadoc reste **présent** (un nom
    expressif ne dispense pas du bloc — l'évaluation lit la grille au sens strict),
    mais il ne paraphrase pas la signature.
- **API (Swagger/OpenAPI)** — *si le projet expose une API REST documentée* : annote
  les endpoints (`@Operation`, `@ApiResponse`, `@Tag`, `@Schema`) et veille à ce que
  les **codes documentés correspondent au comportement réel** (ne documente pas un 401
  pour un cas qui renvoie 404).
- **Logs** mesurés : pas de `log.info("entity founded")` à chaque ligne ; logge les
  décisions et erreurs utiles, pas le flux trivial.

## 9. Hygiène

- Pas de typo dans les messages d'erreur exposés. Pas d'import ni de code mort.
- Les tests (JUnit/Mockito, intégration, JaCoCo) sont couverts par la skill
  `fullstack-test-strategy`.
