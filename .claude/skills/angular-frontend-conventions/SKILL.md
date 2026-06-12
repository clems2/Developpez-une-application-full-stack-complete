---
name: angular-frontend-conventions
description: >
  Conventions front-end Angular (standalone, signals, NGRX Signal Store, RxJS, OnPush)
  à appliquer pour ce projet. Utilise CETTE skill dès que tu crées ou refactores un
  composant, un service, un guard, un intercepteur, un modèle, un store NGRX ou de
  l'état Angular — même si l'utilisateur ne dit pas explicitement "applique les
  conventions". Couvre le state management NGRX Signal Store, le choix signals vs RxJS,
  la stratégie de désabonnement, le pattern ViewModel + computed, le typage strict
  (zéro any), le découpage des composants et l'architecture des dossiers.
---

# Conventions Front Angular

Règles **conditionnelles** : applique la règle par défaut, mais respecte les
exceptions ("préfère X si Y"). Ce sont des conventions validées sur le code
existant, pas des absolus.

Cible technique : **Angular 19 standalone, NGRX Signal Store (`@ngrx/signals`),
Angular Material**.

## 1. Détection de changement

- `ChangeDetectionStrategy.OnPush` sur **tous** les composants par défaut.
- Si un composant doit refléter un état muté en place hors signal/observable
  (rare), documente pourquoi avant de retomber sur la détection par défaut.

## 2. État asynchrone : pattern ViewModel + computed

- Expose un **unique** view-model par page, **dérivé en `computed()` depuis le
  store** (`vm = computed(() => ({ status: ..., items: ... }))`), et lis-le
  directement dans le template (`@if (vm() as v) { ... }`). Avec le Signal Store,
  **l'async pipe n'est plus le véhicule de l'état** : on lit des signals.
- L'`async pipe` ne subsiste que pour un **flux RxJS résiduel** non porté en signal
  (rare). Ne multiplie pas les `| async` dans le template.
- Modélise l'état de chargement en **union explicite**, jamais en booléens épars :
  `type LoadingStatus = 'empty' | 'loading' | 'loaded' | 'error'`.
- Le view-model est une **interface dédiée** (`FeedViewModel`, `ArticleViewModel`),
  pas un objet anonyme non typé.

## 3. State management : NGRX Signal Store (règle de partage)

Le projet impose **NGRX**, en variante **Signal Store (`@ngrx/signals`)**. Partition :

- **État partagé / global** (auth/session, articles, sujets, abonnements, fil) →
  **feature store `signalStore`**. C'est la source de vérité, pas un `BehaviorSubject`.
- **Signals locaux** (`signal()`, `computed()`, `input()`) → état réactif **local**
  à un composant ou dérivé synchrone (ex. ouverture d'un menu, tri courant).
- **RxJS** → composition d'événements asynchrones et flux HTTP **bruts** (dans les
  services et dans `rxMethod`), pas le transport de l'état partagé.
- **`BehaviorSubject`** : toléré **uniquement** pour un état de service local et
  trivial ne justifiant pas un feature store. Ne l'utilise pas pour de l'état
  partagé entre composants — c'est le rôle du store.

### Anatomie d'un feature store

- Un **store par domaine** : `articles`, `subjects`, `auth`, `comments`, `feed`.
- Composition standard :
  - `withState<FeatureState>(initialState)` — l'état, typé par une **interface**
    incluant un `LoadingStatus`.
  - `withComputed(...)` — sélecteurs dérivés (le **view-model** d'une page vit ici
    ou est recomposé côté page à partir de plusieurs `computed`).
  - `withMethods(...)` — mutations via `patchState(store, ...)` ; l'asynchrone
    (appels HTTP) passe par **`rxMethod`** qui gère le cycle de vie de l'abonnement
    (pas de `subscribe` manuel à nettoyer).
  - `withHooks(...)` si une init est nécessaire (`onInit`).
- **Pas de logique métier serveur côté store** : le store orchestre, le **service
  HTTP** (dans `core/service/`) fait l'appel. Le store appelle le service via
  `rxMethod`, applique `patchState` sur succès/erreur.
- **Pureté préservée** : aucune navigation ni effet de bord dans un `computed` (cf.
  §5). La navigation post-action vit dans un `tap` de `rxMethod`, un handler, ou un
  guard.
- Portée : store **`providedIn: 'root'`** pour un état applicatif (session, fil) ;
  store **fourni au niveau d'une route/feature** pour un état dont la durée de vie
  est celle de la page.

> Décision actée (doc de décisions) : **Signal Store** retenu plutôt que le Store
> classique (actions/reducers/effects) pour éviter le boilerplate `toSignal()` en
> contexte OnPush, colocaliser état/méthodes/effets et s'intégrer nativement au
> pattern ViewModel via `computed()`.

## 4. Désabonnement

- **Par défaut : pas de `subscribe` manuel.** L'état asynchrone passe par `rxMethod`
  (store) ou l'async pipe résiduel → rien à désabonner à la main.
- Si un `subscribe` manuel est inévitable hors store, utilise `takeUntilDestroyed()`
  (Angular 16+) plutôt que `takeUntil(destroy$)` + `ngOnDestroy`.
- `take(1)` reste acceptable pour un flux ponctuel garanti de se compléter.

## 5. Pureté : aucun effet de bord dans `map` / `computed`

- `map`, `computed` et les transformations doivent être **purs**.
- N'appelle **jamais** `router.navigate(...)`, un log applicatif ou une mutation
  de service/store depuis un `map` ou un `computed`. Mets la navigation dans un
  `tap` (`rxMethod`), un **guard de route**, ou un handler d'événement dédié.

## 6. DOM impératif (Chart.js, libs tierces)

- Pour piloter du DOM dépendant de la vue, préfère `afterNextRender()` ou
  `ngAfterViewInit()` à un `effect()` lancé dans le constructeur : un `@ViewChild`
  n'existe pas encore au moment où l'`effect` s'exécute la première fois.
- Détruis toujours la ressource impérative (`chart.destroy()`) dans `ngOnDestroy`.

## 7. Typage

- **Zéro `any`.** Si un type est inconnu, utilise `unknown` puis affine par garde.
- N'utilise pas l'assertion non-null `!` pour faire taire le compilateur (ni en TS,
  ni dans le template). Préfère une garde explicite ou un type correct. Exception
  tolérée : `@ViewChild('x') x!: ElementRef` (definite assignment légitime).
- Les modèles sont des **interfaces** dédiées dans `models/`. L'**état** des stores
  est typé par des interfaces dédiées dans `state/`. Évite `value: string | number`
  si un type unique suffit.

## 8. Template

- Control flow moderne : `@if` / `@for` / `@switch`. N'importe plus `NgIf`/`NgForOf`.
- Lis l'état du store **directement en signal** (`@if (vm() as v)`), pas via async
  pipe pour ce qui vient du store.
- Pas d'assertion `!` dans le template ; gère les cas via les branches d'état.

## 9. Découpage des composants

- Composants présentationnels **petits et réutilisables**, pilotés par des
  `input()` signals (ex. `article-card`, `subject-card`, `header`, `spinner`).
- Split container / présentationnel : la page (container) lit le store et construit
  le view-model ; les composants enfants reçoivent des inputs typés et n'ont **pas**
  de logique métier ni d'accès store.
- **Principes SOLID (nommés)** — à pouvoir citer en revue/soutenance :
  - **SRP** : un composant présentationnel = un rôle d'affichage ; le store porte
    l'état, le service porte l'I/O, la page orchestre.
  - **DIP** : les composants dépendent d'abstractions (`input()` typés, store
    injecté), pas d'implémentations concrètes.
  - **OCP/ISP** : petits composants composables plutôt qu'un composant monolithe.

## 10. Architecture des dossiers

```
src/app/
├── components/      # présentationnels réutilisables
├── pages/           # containers routés
├── core/service/    # services HTTP (appels bruts, pas d'état partagé)
├── store/           # feature stores NGRX Signal Store (un fichier par domaine)
├── models/          # interfaces (entités, DTO front)
├── state/           # types d'état (LoadingStatus, interfaces de state, view-models)
├── guards/          # guards (fonctionnels)
└── interceptors/    # intercepteurs (fonctionnels, pas de classe)
```

- **`store/`** : un feature store par domaine (`articles.store.ts`,
  `subjects.store.ts`, `auth.store.ts`, `comments.store.ts`, `feed.store.ts`),
  chacun en `signalStore(...)`.
- Guards et intercepteurs en **style fonctionnel** (`CanActivateFn`,
  `HttpInterceptorFn`), pas de classe historique.
- Bootstrap **standalone** (`bootstrapApplication`, `app.config.ts`).

## 11. Documentation

- **Exigence projet : toute méthode/API publique documentée** en JSDoc/TSDoc.
  Méthodes publiques de services, méthodes de store (`withMethods`), guards,
  intercepteurs et logique non triviale des composants : documente le contrat
  (paramètres, retour, comportement observable) et le *pourquoi*.
  - **Règle de concision pour le trivial** (accesseurs, `input()` simples,
    délégation directe) : une **seule ligne**, sans `@param`/`@returns` s'ils
    n'apportent rien. Le bloc reste **présent** ; il ne paraphrase pas la signature.

## 12. Hygiène

- Pas de code mort ni de blocs commentés laissés en place (`// ...subscribe`,
  `delay(5000)`), pas de hook de cycle de vie vide, pas d'import inutilisé.
- Les tests Jest sont couverts par la skill `angular-jest-test-generator` — ne
  redéfinis pas ici la stratégie de test.
