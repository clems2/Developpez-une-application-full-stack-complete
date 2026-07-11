import { FAKE_JWT, TOKEN_KEY } from '../support/constants';

/**
 * Parcours d'authentification : gardes de route, connexion, inscription, déconnexion,
 * et prise en charge de l'expiration de session par l'intercepteur.
 *
 * Tous les appels `/api/**` sont stubbés : aucun back-end n'est requis. Cypress purge
 * `localStorage` avant chaque test, donc chaque `it` repart d'une session vierge.
 */
describe('Authentification', () => {
  describe('Gardes de route', () => {
    // authGuard : une route protégée sans session renvoie au login.
    it('renvoie vers /login quand une route protégée est demandée sans session', () => {
      cy.visit('/feed');

      cy.location('pathname').should('eq', '/login');
    });

    // guestGuard : les routes publiques sont interdites à une session active.
    it('renvoie vers /feed quand /login est demandé avec une session active', () => {
      cy.intercept({ method: 'GET', pathname: '/api/feed' }, { statusCode: 200, body: [] });

      cy.visitAuthenticated('/login');

      cy.location('pathname').should('eq', '/feed');
    });
  });

  describe('Connexion', () => {
    // Parcours nominal : le token est persisté, la redirection a lieu, et l'intercepteur
    // ajoute bien l'en-tête Authorization sur la requête suivante.
    it("connecte l'utilisateur, persiste le token et redirige vers le fil", () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        fixture: 'auth-response.json',
      }).as('login');
      cy.intercept({ method: 'GET', pathname: '/api/feed' }, { statusCode: 200, body: [] }).as('feed');

      cy.loginViaUi('alice', 'Demo1234!');

      cy.wait('@login')
        .its('request.body')
        .should('deep.equal', { identifier: 'alice', password: 'Demo1234!' });
      cy.location('pathname').should('eq', '/feed');
      cy.window().its('localStorage').invoke('getItem', TOKEN_KEY).should('eq', FAKE_JWT);

      // Vérifie l'intercepteur JWT de bout en bout, ce qu'un test unitaire ne peut pas faire.
      cy.wait('@feed').its('request.headers.authorization').should('eq', `Bearer ${FAKE_JWT}`);
    });

    // 401 : message métier affiché, aucune redirection, aucun token stocké.
    it("affiche un message d'erreur et reste sur la page quand les identifiants sont faux", () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        fixture: 'error-unauthorized.json',
      }).as('login');

      cy.loginViaUi('alice', 'mauvais-mot-de-passe');

      cy.wait('@login');
      cy.get('.auth-error').should('contain.text', 'Identifiant ou mot de passe incorrect.');
      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage').invoke('getItem', TOKEN_KEY).should('be.null');
    });

    // Validation front : le formulaire vide ne déclenche aucun appel réseau.
    it("affiche les erreurs de validation et n'appelle pas l'API si le formulaire est vide", () => {
      cy.intercept('POST', '**/api/auth/login').as('login');

      cy.visit('/login');
      cy.get('.auth-card button[type="submit"]').click();

      cy.get('mat-error').should('have.length', 2);
      cy.get('@login.all').should('have.length', 0);
    });
  });

  describe('Inscription', () => {
    /** Remplit le formulaire d'inscription et le soumet. */
    function fillAndSubmit(username: string, email: string, password: string): void {
      cy.fillInput('username', username);
      cy.fillInput('email', email);
      cy.fillInput('password', password);
      cy.get('.auth-card button[type="submit"]').click();
    }

    // Le back renvoie un token à l'inscription : auto-login, donc redirection vers le fil.
    it("crée le compte, connecte automatiquement l'utilisateur et redirige vers le fil", () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        fixture: 'auth-response.json',
      }).as('register');
      cy.intercept({ method: 'GET', pathname: '/api/feed' }, { statusCode: 200, body: [] });

      cy.visit('/register');
      fillAndSubmit('carla', 'carla@mdd.test', 'Demo1234!');

      cy.wait('@register').its('request.body').should('deep.equal', {
        username: 'carla',
        email: 'carla@mdd.test',
        password: 'Demo1234!',
      });
      cy.location('pathname').should('eq', '/feed');
    });

    // 409 : identifiant ou email déjà pris.
    it("affiche un message d'erreur quand l'identifiant est déjà utilisé", () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        fixture: 'error-conflict.json',
      }).as('register');

      cy.visit('/register');
      fillAndSubmit('alice', 'alice@mdd.test', 'Demo1234!');

      cy.wait('@register');
      cy.get('.auth-error').should('contain.text', 'La création du compte a échoué');
      cy.location('pathname').should('eq', '/register');
    });

    // La règle de mot de passe est appliquée côté front avant tout appel réseau.
    it("rejette un mot de passe non conforme sans appeler l'API", () => {
      cy.intercept('POST', '**/api/auth/register').as('register');

      cy.visit('/register');
      fillAndSubmit('carla', 'carla@mdd.test', 'faible');

      cy.get('mat-error').should('contain.text', 'au moins 8 caractères');
      cy.get('@register.all').should('have.length', 0);
    });
  });

  describe('Déconnexion', () => {
    // Chemin desktop : l'icône utilisateur ouvre un mat-menu (overlay CDK) contenant
    // « Se déconnecter ». Le viewport par défaut de la suite (1280px) est en mode desktop,
    // donc le panneau latéral mobile n'entre pas en jeu ici.
    it("purge le token et renvoie à l'accueil", () => {
      cy.intercept({ method: 'GET', pathname: '/api/feed' }, { statusCode: 200, body: [] }).as('feed');

      cy.visitAuthenticated('/feed');
      cy.wait('@feed');

      cy.get('.header__user').click();
      cy.get('.mat-mdc-menu-panel').contains('Se déconnecter').click();

      cy.location('pathname').should('eq', '/');
      cy.window().its('localStorage').invoke('getItem', TOKEN_KEY).should('be.null');
    });
  });

  describe('Expiration de session', () => {
    // Un 401 hors /api/auth/** est traité par l'intercepteur : purge + redirection.
    it('purge la session et renvoie au login quand une requête protégée reçoit un 401', () => {
      cy.intercept(
        { method: 'GET', pathname: '/api/feed' },
        { statusCode: 401, fixture: 'error-unauthorized.json' },
      ).as('feed');

      cy.visitAuthenticated('/feed');

      cy.wait('@feed');
      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage').invoke('getItem', TOKEN_KEY).should('be.null');
    });
  });
});