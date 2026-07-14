# MDD — Monde de Dév

Réseau social MVP pour développeurs, développé pour l'entreprise ORION. Les utilisateurs
s'abonnent à des thèmes de programmation, consultent un fil d'actualité personnalisé,
publient des articles et les commentent.

Mono-repo : le back-end (API REST) est dans `back/`, le front-end (SPA) dans `front/`.

---

## Stack technique

| Couche | Technologies |
|---|---|
| Back-end | Java 21, Spring Boot 3.5, Spring Security + JWT, Spring Data JPA, Flyway |
| Base de données | MySQL 8 (dev/prod), H2 en mémoire (tests) |
| Front-end | Angular 19 (standalone), NgRx Signal Store, Angular Material, RxJS |
| Build | Maven (back), Angular CLI / npm (front) |
| Tests | JUnit 5 + Mockito + JaCoCo (back), Jest (front), Cypress (E2E) |
| Qualité | SpotBugs (back), ESLint (front) |
| Documentation API | Swagger / OpenAPI (springdoc) |

---

## Prérequis

Avant de lancer le projet, vérifiez que les outils suivants sont installés. Chaque section
ci-dessous indique **comment les installer si vous ne les avez pas**.

| Outil | Version | Vérifier la présence |
|---|---|---|
| JDK (Java) | 21 | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 20.x | `node -version` |
| npm | 10.x | `npm -version` |
| MySQL | 8.x | `mysql --version` |
| Angular CLI | 19.x | `ng version` |

### Installer Java 21

Téléchargez le JDK 21 depuis [Adoptium (Temurin)](https://adoptium.net/temurin/releases/?version=21)
ou [Oracle](https://www.oracle.com/java/technologies/downloads/#java21). Après installation,
vérifiez :

```bash
java -version
```

### Installer Maven

Le projet inclut le **Maven Wrapper** (`mvnw` / `mvnw.cmd`) : vous n'avez donc **pas besoin**
d'installer Maven globalement. Le wrapper télécharge la bonne version automatiquement au premier
usage. Si vous préférez tout de même une installation globale, suivez
[le guide officiel](https://maven.apache.org/install.html).

### Installer Node.js et npm

Téléchargez Node.js 20 LTS depuis [nodejs.org](https://nodejs.org/) (npm est inclus). Vérifiez :

```bash
node -version
npm -version
```

### Installer Angular CLI

Une fois Node installé, l'Angular CLI utilisé par le projet est déjà présent en dépendance
locale (dans `node_modules` après `npm install`) : préfixez vos commandes par `npx` (ex.
`npx ng serve`). Pour une installation globale optionnelle :

```bash
npm install -g @angular/cli@19
```

### Installer MySQL

Téléchargez MySQL 8 Community Server depuis
[dev.mysql.com](https://dev.mysql.com/downloads/mysql/). MySQL Workbench facilite la création
de la base et de l'utilisateur.

---

## Configuration

### Base de données

Créez une base et un utilisateur MySQL (via MySQL Workbench ou en ligne de commande) :

```sql
CREATE DATABASE mdd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mdd_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON mdd.* TO 'mdd_user'@'localhost';
FLUSH PRIVILEGES;
```

Le schéma est ensuite créé automatiquement par **Flyway** au démarrage du back-end (migrations
`V1` à `V7` dans `back/src/main/resources/db/migration/`). Aucune création de table manuelle
n'est nécessaire.

### Variables d'environnement (back-end)

Le back-end lit sa configuration depuis des variables d'environnement (jamais commitées, pour
ne pas exposer de secrets). Six variables sont attendues :

| Variable | Description | Défaut |
|---|---|---|
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_NAME` | Nom de la base | `mdd` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | *(vide)* |
| `JWT_SECRET` | Clé de signature JWT (≥ 32 caractères) | *(vide, obligatoire)* |
| `SHOW_SQL` | Journalisation SQL (dev uniquement) | `false` |

**Windows (PowerShell)** — un script `set-env.ps1` (non versionné, à créer à la racine de
`back/`) permet d'injecter ces variables dans la session courante :

```powershell
$env:DB_HOST     = "localhost"
$env:DB_PORT     = "3306"
$env:DB_NAME     = "mdd"
$env:DB_USER     = "mdd_user"
$env:DB_PASSWORD = "votre_mot_de_passe"
$env:JWT_SECRET  = "une_cle_secrete_d_au_moins_32_caracteres"
```

Chargez-le avant de lancer le back : `. .\set-env.ps1`

**Linux / macOS (bash)** :

```bash
export DB_HOST=localhost DB_PORT=3306 DB_NAME=mdd
export DB_USER=mdd_user DB_PASSWORD=votre_mot_de_passe
export JWT_SECRET=une_cle_secrete_d_au_moins_32_caracteres
```

---

## Installation

Clonez le dépôt, puis installez les dépendances de chaque partie.

```bash
git clone <url-du-depot>
cd <dossier-du-projet>
```

### Back-end

```bash
cd back
# le wrapper Maven télécharge les dépendances au premier build
./mvnw clean install        # Linux/macOS
.\mvnw.cmd clean install     # Windows
```

### Front-end

```bash
cd front
npm install
```

---

## Lancement (développement)

Deux terminaux, MySQL démarré.

### Back-end (port 8080)

```bash
cd back
# Windows : charger d'abord les variables d'environnement
. .\set-env.ps1
.\mvnw.cmd spring-boot:run
# Linux/macOS : export des variables puis ./mvnw spring-boot:run
```

L'API démarre sur `http://localhost:8080`. Flyway applique les migrations au premier lancement.

### Front-end (port 4200)

```bash
cd front
npm start          # équivaut à : npx ng serve
```

L'application est accessible sur `http://localhost:4200`. Un proxy (`proxy.conf.json`) redirige
les appels `/api` vers le back-end sur le port 8080.

---

## Build (production)

### Back-end

```bash
cd back
.\mvnw.cmd clean package
```

Produit un JAR exécutable dans `back/target/`. Lancement :

```bash
java -jar target/mdd-api-0.0.1-SNAPSHOT.jar
```

### Front-end

```bash
cd front
npm run build
```

Produit les fichiers statiques optimisés dans `front/dist/front/browser/`, à servir par un
serveur web (nginx, Apache) ou un hébergeur statique. Pensez à activer la compression (gzip)
et les en-têtes de cache en production.

---

## Tests

### Back-end (JUnit + JaCoCo)

```bash
cd back
.\mvnw.cmd clean verify
```

Exécute les tests unitaires et d'intégration, génère le rapport de couverture JaCoCo
(`back/target/site/jacoco/index.html`), vérifie le seuil de 70 % et lance l'analyse SpotBugs.

### Front-end (Jest)

```bash
cd front
npm test              # tests
npm run test:cov      # tests + rapport de couverture (coverage/jest/)
```

### End-to-end (Cypress)

```bash
cd front
npm start             # dans un premier terminal
npm run e2e           # dans un second (ou npm run e2e:open pour l'interface)
```

### Analyse statique (front)

```bash
cd front
npx ng lint
```

---

## Documentation de l'API

Une fois le back-end lancé, la documentation interactive **Swagger UI** est disponible sur :

```
http://localhost:8080/swagger-ui.html
```

### Principaux endpoints

| Endpoint | Méthode | Accès | Description |
|---|---|---|---|
| `/api/auth/register` | POST | public | Inscription (retourne un JWT) |
| `/api/auth/login` | POST | public | Connexion par e-mail ou username (retourne un JWT) |
| `/api/me` | GET / PUT | authentifié | Consulter / mettre à jour son profil |
| `/api/topics` | GET | authentifié | Liste des thèmes |
| `/api/topics/{id}/subscribe` | POST / DELETE | authentifié | S'abonner / se désabonner |
| `/api/feed` | GET | authentifié | Fil d'actualité (param `order=asc\|desc`) |
| `/api/posts` | POST | authentifié | Créer un article |
| `/api/posts/{id}` | GET | authentifié | Détail d'un article + commentaires |
| `/api/posts/{id}/comments` | POST | authentifié | Ajouter un commentaire |

Toutes les routes `/api/**` (hors `auth`) requièrent un en-tête `Authorization: Bearer <token>`.

---

## Conformité

Les documents de conformité sont disponibles dans le dossier `docs/` :

- [Mentions légales](docs/mentions-legales.md)
- [Politique de confidentialité](docs/politique-de-confidentialite.md)

---

## Structure du projet

```
.
├── back/                 # API REST Spring Boot
│   ├── src/main/java/     # code source (controller, service, repository, security…)
│   ├── src/main/resources/
│   │   ├── db/migration/  # migrations Flyway (V1 → V7)
│   │   └── application.yml
│   └── pom.xml
├── front/                # SPA Angular
│   ├── src/app/           # composants, pages, stores, services, guards
│   ├── cypress/           # tests E2E
│   └── package.json
├── docs/                 # documents de conformité
└── README.md
```