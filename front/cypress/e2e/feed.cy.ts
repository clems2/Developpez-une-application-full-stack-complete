/**
 * Parcours du fil d'actualité : affichage des articles des thèmes suivis, tri par date,
 * navigation vers le détail, états vide et erreur.
 *
 * Le tri est délégué au back (paramètre `order`) : les assertions portent donc sur la
 * requête émise, pas sur un réordonnancement côté client.
 */
describe("Fil d'actualité", () => {
  // Chargement initial : le fil demande explicitement l'ordre décroissant.
  it('affiche les articles du fil et demande un tri décroissant par défaut', () => {
    cy.intercept({ method: 'GET', pathname: '/api/feed' }, { fixture: 'feed.json' }).as('feed');

    cy.visitAuthenticated('/feed');

    cy.wait('@feed').its('request.query.order').should('eq', 'desc');
    cy.get('.article-card').should('have.length', 2);
    cy.get('.article-card').first().should('contain.text', 'Les records en Java 21');
    cy.get('.article-card').first().should('contain.text', 'alice');
  });

  // Le tri déclenche une NOUVELLE requête serveur : rien n'est réordonné localement.
  it('rebascule le tri en croissant et redemande le fil au serveur', () => {
    cy.intercept({ method: 'GET', pathname: '/api/feed' }, { fixture: 'feed.json' }).as('feed');

    cy.visitAuthenticated('/feed');
    cy.wait('@feed').its('request.query.order').should('eq', 'desc');

    cy.contains('button', 'Trier par').click();

    cy.wait('@feed').its('request.query.order').should('eq', 'asc');
    cy.contains('button', 'Trier par').find('mat-icon').should('have.text', 'arrow_upward');
  });

  // La carte est un lien vers le détail de l'article.
  it("navigue vers le détail de l'article au clic sur une carte", () => {
    cy.intercept({ method: 'GET', pathname: '/api/feed' }, { fixture: 'feed.json' }).as('feed');
    cy.intercept({ method: 'GET', pathname: '/api/posts/10' }, { fixture: 'post-detail.json' }).as(
      'detail',
    );

    cy.visitAuthenticated('/feed');
    cy.wait('@feed');

    cy.contains('.article-card', 'Les records en Java 21').click();

    cy.wait('@detail');
    cy.location('pathname').should('eq', '/articles/10');
    cy.get('.detail__title').should('contain.text', 'Les records en Java 21');
  });

  // Le bouton d'action mène au formulaire de création.
  it('mène au formulaire de création depuis le fil', () => {
    cy.intercept({ method: 'GET', pathname: '/api/feed' }, { fixture: 'feed.json' }).as('feed');
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' });

    cy.visitAuthenticated('/feed');
    cy.wait('@feed');

    cy.contains('a', 'Créer un article').click();

    cy.location('pathname').should('eq', '/articles/new');
  });

  // Aucun abonnement : message explicite, pas une liste vide silencieuse.
  it("affiche un état vide quand l'utilisateur n'est abonné à aucun thème", () => {
    cy.intercept({ method: 'GET', pathname: '/api/feed' }, { body: [] }).as('feed');

    cy.visitAuthenticated('/feed');
    cy.wait('@feed');

    cy.get('.feed__empty').should('contain.text', "vous n'êtes abonné à aucun thème");
    cy.get('.article-card').should('not.exist');
  });

  // Échec serveur : message d'erreur, aucune carte.
  it("affiche un message d'erreur quand le chargement du fil échoue", () => {
    cy.intercept(
      { method: 'GET', pathname: '/api/feed' },
      { statusCode: 500, fixture: 'error-server.json' },
    ).as('feed');

    cy.visitAuthenticated('/feed');
    cy.wait('@feed');

    cy.get('.feed__error').should('be.visible');
    cy.get('.article-card').should('not.exist');
  });
});