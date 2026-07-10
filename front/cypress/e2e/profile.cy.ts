import { TOKEN_KEY } from '../support/constants';

/**
 * Parcours du profil : consultation, mise à jour des informations, désabonnement.
 *
 * Le `username` étant le sujet du JWT, toute mise à jour réussie invalide la session : le
 * front déconnecte systématiquement et renvoie au login (décision « reconnexion uniforme »).
 */
describe('Profil', () => {
  /** Intercepte le chargement du profil et visite la page. */
  function visitProfile(): void {
    cy.intercept({ method: 'GET', pathname: '/api/me' }, { fixture: 'profile.json' }).as('profile');
    cy.visitAuthenticated('/me');
    cy.wait('@profile');
  }

  // Le formulaire est pré-rempli, et les abonnements sont listés.
  it('affiche le profil pré-rempli et la liste des abonnements', () => {
    visitProfile();

    cy.get('[formControlName="username"]').should('have.value', 'alice');
    cy.get('[formControlName="email"]').should('have.value', 'alice@mdd.test');
    cy.get('[formControlName="password"]').should('have.value', '');
    cy.get('.subscription').should('have.length', 1).and('contain.text', 'Java');
  });

  // Garde `hasChanges()` : aucune requête possible tant que rien n'a changé.
  it("désactive l'enregistrement tant qu'aucune information n'a changé", () => {
    visitProfile();

    cy.get('.profile__section form button[type="submit"]').should('be.disabled');
    cy.contains('Aucune modification à enregistrer.').should('be.visible');

    cy.fillInput('username', 'alice2');

    cy.get('.profile__section form button[type="submit"]').should('not.be.disabled');
    cy.contains('vous serez déconnecté').should('be.visible');
  });

  // Mise à jour réussie : le mot de passe vide signifie « inchangé », puis déconnexion.
  it("met à jour le profil puis déconnecte l'utilisateur", () => {
    visitProfile();
    cy.intercept({ method: 'PUT', pathname: '/api/me' }, { fixture: 'profile.json' }).as('update');

    cy.fillInput('username', 'alice2');
    cy.get('.profile__section form button[type="submit"]').click();

    cy.wait('@update').its('request.body').should('deep.equal', {
      username: 'alice2',
      email: 'alice@mdd.test',
      password: '',
    });

    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage').invoke('getItem', TOKEN_KEY).should('be.null');
  });

  // 409 : le message métier s'affiche et la session reste active.
  it("affiche un message d'erreur quand le nom d'utilisateur est déjà pris", () => {
    visitProfile();
    cy.intercept(
      { method: 'PUT', pathname: '/api/me' },
      { statusCode: 409, fixture: 'error-conflict.json' },
    ).as('update');

    cy.fillInput('username', 'bob');
    cy.get('.profile__section form button[type="submit"]').click();

    cy.wait('@update');
    cy.get('.profile__error').should('contain.text', 'déjà utilisé');
    cy.location('pathname').should('eq', '/me');
    cy.window().its('localStorage').invoke('getItem', TOKEN_KEY).should('not.be.null');
  });

  // Mot de passe optionnel : s'il est renseigné, il doit respecter la règle. Aucun appel sinon.
  it("rejette un mot de passe non conforme sans appeler l'API", () => {
    visitProfile();
    cy.intercept({ method: 'PUT', pathname: '/api/me' }).as('update');

    cy.fillInput('password', 'faible');
    cy.get('.profile__section form button[type="submit"]').click();

    cy.get('mat-error').should('contain.text', 'au moins 8 caractères');
    cy.get('@update.all').should('have.length', 0);
  });

  // Désabonnement : retrait immutable de la liste, sans rechargement du profil.
  it("désabonne l'utilisateur d'un sujet", () => {
    visitProfile();
    cy.intercept({ method: 'DELETE', pathname: '/api/topics/1/subscribe' }, { statusCode: 200 }).as(
      'unsubscribe',
    );

    cy.contains('.subscription', 'Java').find('button').click();

    cy.wait('@unsubscribe');
    cy.get('.subscription').should('not.exist');
    cy.contains("Vous n'êtes abonné à aucun sujet.").should('be.visible');

    // Une seule requête de profil : la liste est mutée en état, pas rechargée.
    cy.get('@profile.all').should('have.length', 1);
  });
});