/**
 * Parcours des thèmes : consultation de la liste, abonnement, et états d'erreur.
 *
 * Le désabonnement n'est pas testé ici : conformément aux spécifications, il n'est
 * accessible que depuis la page profil (cf. `profile.cy.ts`).
 */
describe('Thèmes', () => {
  // Le drapeau `subscribed`, calculé par le back pour l'utilisateur courant, pilote le bouton.
  it("affiche les thèmes avec leur état d'abonnement", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');

    cy.visitAuthenticated('/topics');
    cy.wait('@topics');

    cy.get('.topic-card').should('have.length', 3);

    cy.contains('.topic-card', 'Java')
      .find('button')
      .should('be.disabled')
      .and('contain.text', 'Déjà abonné');

    cy.contains('.topic-card', 'Angular')
      .find('button')
      .should('not.be.disabled')
      .and('contain.text', "S'abonner");
  });

  // Le bouton ne bascule qu'APRÈS confirmation du serveur (pas de mise à jour optimiste).
  it("abonne l'utilisateur au thème et désactive le bouton après confirmation serveur", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');
    cy.intercept({ method: 'POST', pathname: '/api/topics/2/subscribe' }, { statusCode: 200 }).as(
      'subscribe',
    );

    cy.visitAuthenticated('/topics');
    cy.wait('@topics');

    cy.contains('.topic-card', 'Angular').find('button').click();
    cy.wait('@subscribe');

    cy.contains('.topic-card', 'Angular')
      .find('button')
      .should('be.disabled')
      .and('contain.text', 'Déjà abonné');

    // Les autres cartes ne sont pas affectées : la mutation est ciblée, pas un rechargement.
    cy.contains('.topic-card', 'DevOps').find('button').should('contain.text', "S'abonner");
    cy.get('@topics.all').should('have.length', 1);
  });

  // Échec du chargement : la liste laisse place à un message, aucune carte n'est rendue.
  it("affiche un message d'erreur quand le chargement des thèmes échoue", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, {
      statusCode: 500,
      fixture: 'error-server.json',
    }).as('topics');

    cy.visitAuthenticated('/topics');
    cy.wait('@topics');

    cy.contains('Une erreur est survenue lors du chargement des thèmes.').should('be.visible');
    cy.get('.topic-card').should('not.exist');
  });

  // Échec de l'abonnement : le store bascule en `error`, la vue affiche le message global.
  it("affiche un message d'erreur quand l'abonnement échoue", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');
    cy.intercept({ method: 'POST', pathname: '/api/topics/2/subscribe' }, {
      statusCode: 500,
      fixture: 'error-server.json',
    }).as('subscribe');

    cy.visitAuthenticated('/topics');
    cy.wait('@topics');

    cy.contains('.topic-card', 'Angular').find('button').click();
    cy.wait('@subscribe');

    cy.contains('Une erreur est survenue lors du chargement des thèmes.').should('be.visible');
  });

  // Liste vide côté serveur : état vide explicite, pas de grille vide silencieuse.
  it("affiche un état vide quand aucun thème n'est disponible", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { body: [] }).as('topics');

    cy.visitAuthenticated('/topics');
    cy.wait('@topics');

    cy.contains('Aucun thème disponible.').should('be.visible');
  });
});