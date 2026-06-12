---
name: fullstack-test-strategy
description: >
  Stratégie de test full-stack à appliquer pour ce projet : back JUnit/Mockito vs
  intégration Spring, test end-to-end des mappers MapStruct, configuration JaCoCo,
  seuils de couverture et tests E2E Cypress. Utilise CETTE skill dès que tu écris ou
  organises des tests, configures JaCoCo/nyc, discutes de couverture, ou décides quoi
  tester et comment — même sans demande explicite de "stratégie". Pour la GÉNÉRATION
  de tests Jest Angular, délègue à la skill `angular-jest-test-generator`.
---

# Stratégie de test full-stack

Règles **conditionnelles**. Objectif : une couverture **intelligente**, pas la chasse
au 100%.

## 0. Philosophie

- On teste un **comportement attendu**, pas une ligne. Chaque test doit pouvoir
  répondre à "qu'est-ce qui casse si je supprime ce test ?".
- Couvre explicitement les **cas négatifs et limites** (erreurs, valeurs nulles,
  accès refusé, bouton désactivé) — pas seulement le chemin heureux.
- Commente le **pourquoi** d'un test non trivial, pas le quoi.
- **Seuils : gate CI à 70 %, cible de travail à 80 %.** Le seuil exigé par le projet
  est **70 %** (c'est ce que verrouillent JaCoCo / Jest / nyc, voir §3–4). À la
  **génération** de tests, vise **~80 %** pour garder de la marge ; mais on ne fait
  pas échouer un build pour un composant purement visuel non testé. 70 % de tests qui
  ont du sens > 100 % gonflé artificiellement.

## 1. Back : unitaire vs intégration

| Niveau         | Cible                  | Outils                                                          |
|----------------|------------------------|----------------------------------------------------------------|
| **Unitaire**   | Services (logique)     | `@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks` — **pas** de contexte Spring |
| **Intégration**| Controllers (bout en bout) | `@SpringBootTest` + `@AutoConfigureMockMvc` + `@ActiveProfiles("test")` + `@Transactional`, suffixe `IT` |

- **Base de test : H2 en mémoire**, activée par le profil `test`
  (`application-test.yml`/`.properties` : datasource H2, `ddl-auto: create-drop`).
  La prod reste **MySQL** (contrainte ORION) ; H2 ne sert qu'aux tests d'intégration,
  pour des runs rapides et isolés sans dépendre d'une base externe. Veille à ce que le
  schéma JPA reste compatible MySQL **et** H2 (types/contraintes neutres).
- Tests unitaires de service : pur Mockito, rapides, sans contexte. AssertJ
  (`assertThat`, `assertThatThrownBy`) et vérifications négatives (`verify(...).never()`).
- Tests d'intégration controller : `MockMvc` + `jsonPath`, données semées via repos
  dans `@BeforeEach`, `@WithMockUser` pour l'auth, `@Transactional` pour le rollback.
- Vise **≥ ~30% d'intégration**.
- Si tu introduis une classe de base d'intégration (`AbstractIntegrationTest`), elle
  doit **porter les annotations communes** (`@SpringBootTest`, etc.) ; sinon ne la
  crée pas (une classe vide ne sert à rien).

## 2. Mappers MapStruct (pattern signature)

- **Exclus le code MapStruct généré des métriques** JaCoCo (c'est du code généré, pas
  authored) — voir §3.
- **MAIS teste les mappers de bout en bout** : `@SpringBootTest`, mappers **réels
  autowirés** (pas mockés), persistance réelle, et **couvre les branches nulles**
  (ex. `theme` null sur un `Article`, liste `comments` null sur un `Post`). On valide
  ainsi la donnée réellement produite malgré le code invisible généré.

## 3. JaCoCo

- Exécutions : `prepare-agent`, `report`, `jacoco-check`.
- **Les `<excludes>` doivent être identiques** entre `report` et `jacoco-check`
  (sinon le rapport et le seuil divergent).
- Exclusions typiques : `**/dto/**`, `**/payload/**`, `**/models/**`, `**/mapper/**`
  (généré), classe `*Application`.
- **N'exclus PAS tout `**/exception/**` en bloc** : le `GlobalExceptionHandler`
  contient de la vraie logique de branches (authored) et doit être **mesuré**. Exclus
  au plus les classes d'exception triviales, pas le handler.
- **Seuils (gate) : 70%** sur `INSTRUCTION`, `BRANCH`, `LINE` (élément `BUNDLE`).
  Cible de travail recommandée : ~80%, mais le `jacoco-check` est configuré à **70%**
  pour ne pas bloquer une démo sur un écart mineur.

## 4. Front : Jest et Cypress

- **Génération des tests Jest Angular → skill `angular-jest-test-generator`** (unit vs
  intégration par injection, APIs modernes, templates). Ne duplique pas ces règles ici.
- **Seuils Jest (gate) : 70%** sur statements / branches / lines / functions
  (`coverageThreshold`), cible de travail ~80% ; `collectCoverageFrom` excluant
  `*.module.ts`, `*.interface.ts`, `*.routes.ts`, `app.config.ts`, `*.d.ts`.
- **Cypress E2E** : isole le back avec `cy.intercept` + **fixtures** (un fixture par
  type d'entité/d'utilisateur), `cy.wait('@alias')`, assertions sur l'URL et l'UI
  visible. Couvre les états d'erreur et de validation (champ manquant, mauvais
  identifiants), pas seulement les parcours nominaux.
- Pour la **couverture E2E**, instrumente via `.nycrc`
  (`@istanbuljs/nyc-config-typescript`, **seuils 70%**) cohérent avec les exclusions
  Jest.

## 5. Nommage et lisibilité

- Noms de tests orientés comportement : `create_shouldSaveAndReturnArticle`,
  `subscribe_shouldRejectWhenAlreadySubscribed`,
  `should add Authorization header when user is logged in`.
- Un test = une intention claire. Évite les tests qui valident trois choses à la fois.
