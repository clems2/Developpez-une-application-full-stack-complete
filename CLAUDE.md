# CLAUDE.md — Projet MDD (Monde de Dév)

> Ce fichier porte le **contexte projet** pour Claude Code. Les **conventions de code**
> vivent dans `.claude/skills/` (4 skills, déclenchées automatiquement). Les **décisions
> d'architecture** vivent dans le *doc de décisions techniques* — pas ici, pas dans les
> skills. Claude reste **contradicteur** sur ces décisions : il ne tranche pas à la
> place de l'auteur.

## 1. Contexte

MVP d'un réseau social pour développeurs (entreprise ORION). L'utilisateur s'abonne à
des **sujets** (thèmes de programmation), consulte un **fil** chronologique des
**articles** de ses abonnements, publie des articles et des **commentaires**.

Périmètre **MVP strict** — s'en tenir aux spécifications fonctionnelles, ne rien
ajouter ni retirer :

- Pas de back-office / zone admin.
- Pas d'upload de fichiers (tout est texte).
- Commentaires non récursifs (pas de sous-commentaires).
- La connexion doit **persister entre les sessions**.
- Application **responsive** (desktop + mobile), conforme aux maquettes.

Projet **évalué avec soutenance** : au-delà du code, sont attendus la justification des
choix techniques, une posture de supervision de l'IA (déléguer + relire/valider), une
revue technique et une documentation claire (technique + FAQ utilisateur).

## 2. Stack cible (à atteindre)

| Couche      | Cible |
|-------------|-------|
| Back        | **Spring Boot 3.5.x** (dernier patch : 3.5.13), **Java 21**, Maven (wrapper `mvnw`) |
| Base prod   | **MySQL** (relationnel, Spring Data JPA) |
| Base test   | **H2 en mémoire** (profil `test`, `ddl-auto: create-drop`) |
| Front       | **Angular 19 standalone**, **NGRX Signal Store** (`@ngrx/signals`, aligné Angular 19), Angular Material 19, RxJS |
| Sécurité    | **JWT stateless** (Spring Security 6, DSL lambda) |
| Tests       | **JUnit 5 + Mockito**, **Jest** (remplace Karma/Jasmine), **Cypress** E2E |
| Couverture  | **Gate CI 70 %**, cible de travail 80 % |
| Doc API     | **Endpoints documentés** : README + table « API et schémas de données » du template. Outil de test : **Postman**. *(Swagger/OpenAPI non imposé par ORION → optionnel, à trancher dans le doc de décisions.)* |
| Node        | **20 LTS** (ou 22) pour Angular 19 |

> Note décision (à reporter dans le doc de décisions) : Boot **3.5** est la dernière
> minor 3.x ; patchs OSS jusqu'au 30/06/2026, 4.0 étant la trajectoire forward. On
> reste sur 3.5 par contrainte ORION et périmètre MVP. Verrouiller le patch exact à
> l'install.

## 3. Stack de départ (legacy — repo forké, à migrer)

- **Back** : Spring Boot **2.7.3** / Java **11**. Quasi-vide : `MddApiApplication`
  (main) + `MddApiApplicationTests` (`contextLoads`). `application.properties` **vide**.
  Dépendance `mysql:mysql-connector-java` (coordonnées dépréciées).
- **Front** : Angular **14.1** / **NgModule** (`platformBrowserDynamic().bootstrapModule(AppModule)`),
  Material 14, tests **Karma/Jasmine**, un `HomeComponent` sous `pages/home/`. Aucun
  NGRX, aucun signal.

➡️ **Première tâche du projet = montée de version** (voir §6).

## 4. Structure du repo

```
.
├── CLAUDE.md                 # ce fichier (contexte projet)
├── .claude/
│   └── skills/               # conventions (déclenchées auto par Claude Code)
│       ├── angular-frontend-conventions/SKILL.md
│       ├── spring-backend-conventions/SKILL.md
│       ├── fullstack-test-strategy/SKILL.md
│       └── angular-jest-test-generator/SKILL.md
├── back/                     # API Spring Boot (Maven)
│   ├── mvnw / mvnw.cmd
│   ├── pom.xml
│   └── src/main/java/com/openclassrooms/mddapi/...
└── front/                    # Application Angular (CLI)
    ├── package.json
    ├── angular.json
    └── src/app/...
```

Un **seul repository** pour tout le projet (contrainte ORION).

## 5. Conventions (portées par les skills)

Ne **pas** dupliquer ici les règles de code. Référentiels :

- `spring-backend-conventions` — archi Controller→Service→Repository, injection par
  constructeur, DTO `record` + MapStruct, exceptions 401/403/404, sécurité JWT
  (DSL lambda Security 6), imports `jakarta.*`, SOLID nommé, Javadoc sur tout public.
- `angular-frontend-conventions` — standalone, **NGRX Signal Store** pour l'état
  partagé, OnPush, pattern ViewModel en `computed()`, guards/intercepteurs
  fonctionnels, SOLID nommé, TSDoc sur tout public.
- `fullstack-test-strategy` — unitaire (Mockito) vs intégration (`@SpringBootTest` +
  MockMvc, base **H2**), mappers MapStruct testés bout-en-bout, JaCoCo/Jest/nyc
  **gate 70 %**.
- `angular-jest-test-generator` — génération des tests Jest (templates standalone,
  HTTP, guards, intercepteurs, MatSnackBar, ActivatedRoute), gate 70 % / cible 80 %.

## 6. Migration (première tâche, par lots committés)

**Back** :
- `spring-boot-starter-parent` 2.7.3 → **3.5.x** ; `<java.version>` 11 → **21**.
- `javax.*` → `jakarta.*` (persistence, validation) — sinon entités non scannées au runtime.
- `mysql:mysql-connector-java` → `com.mysql:mysql-connector-j`.
- Config sécurité en **DSL lambda** Spring Security 6 (plus de style chaîné `.and()`).

**Front** :
- Angular 14 → **19** via `ng update` **par paliers** (14→15→16→17→18→19), pas d'un bond.
- Bootstrap **NgModule → standalone** (`bootstrapApplication`, `app.config.ts`).
- Ajouter **`@ngrx/signals`** (Signal Store).
- **Karma/Jasmine → Jest** (`jest-preset-angular`), puis adapter le script `test`.
- Ajouter **Cypress** (E2E).

Valider la migration par **une action simple end-to-end** (front → back → BDD) avant
d'implémenter les fonctionnalités (étape 4 de la consigne) : objectif = aucune surprise
d'architecture par la suite.

## 7. Commandes

> ⚠️ Certaines ne fonctionnent qu'**après** la migration / l'ajout des dépendances
> (Jest, JaCoCo, Cypress). Marquées *(post-migration)*.

**Back** — depuis `back/` (Windows : remplacer `./mvnw` par `mvnw.cmd`) :
- Build : `./mvnw clean install`
- Run : `./mvnw spring-boot:run`
- Tests : `./mvnw test`
- Tests + couverture : `./mvnw verify` *(JaCoCo, post-config)*

**Front** — depuis `front/` :
- Install : `npm install`
- Run : `npm start` (= `ng serve`, http://localhost:4200)
- Build : `npm run build`
- Tests : `npm test` *(Jest, post-migration)*
- E2E : `npx cypress open` / `npx cypress run` *(post-config)*

## 8. Workflow Git

- **Gitflow** : `main` (releases stables, taguées), `develop` (intégration),
  `feature/*` (une par fonctionnalité).
- **Conventional Commits** avec scope : `feat(back): ...`, `fix(front): ...`,
  `test(...)`, `docs(...)`, `chore(...)`, `refactor(...)`.
- Commits **incrémentaux** après chaque étape vérifiée ; release finale taguée.

## 9. Posture de supervision IA

- Déléguer le **code répétitif/à faible risque** (DTO, mappers, CRUD basique, tests
  unitaires standards) ; **toujours relire** assertions, cas limites, codes HTTP.
- Garder les **décisions d'architecture hors des skills** : Claude les **challenge**,
  ne les applique pas mécaniquement.
- **Ne pas surcomplexifier la sécurité** (MVP interne) ni le périmètre fonctionnel.

## 10. Doc de décisions techniques

Les choix structurants — Signal Store vs Store classique, JWT vs Basic Auth, H2 vs
TestContainers, architecture en couches, librairies (Lombok, MapStruct, springdoc…) —
sont **justifiés** (comparatif avantages/inconvénients) dans le *doc de décisions*
(template « Justification des choix techniques »). Ce document est le livrable de
préparation de soutenance ; il est la **source de vérité des décisions**, le présent
`CLAUDE.md` n'en porte que le résumé opérationnel.
