/**
 * Parcours de création d'un article.
 *
 * Règle métier (correctif tuteur) : un article ne peut être publié que sur un sujet auquel
 * l'auteur est abonné. Elle est appliquée à deux niveaux — filtre UX du `<mat-select>` côté
 * front, et garde autoritaire côté back (403). Les deux sont couverts ici.
 */
describe("Création d'un article", () => {
  // Parcours nominal : seuls les sujets abonnés sont proposés, et le back reçoit le bon corps.
  it("crée l'article sur un sujet suivi et redirige vers le fil", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');
    cy.intercept(
      { method: 'POST', pathname: '/api/posts' },
      { statusCode: 201, fixture: 'post-created.json' },
    ).as('create');
    cy.intercept({ method: 'GET', pathname: '/api/feed' }, { body: [] });

    cy.visitAuthenticated('/articles/new');
    cy.wait('@topics');

    cy.selectOption('topicId', 'Java');
    cy.fillInput('title', 'Sealed interfaces');
    cy.fillInput('content', 'Fermer une hiérarchie pour rendre le pattern matching exhaustif.');
    cy.get('.article-form button[type="submit"]').click();

    cy.wait('@create').its('request.body').should('deep.equal', {
      topicId: 1,
      title: 'Sealed interfaces',
      content: 'Fermer une hiérarchie pour rendre le pattern matching exhaustif.',
    });
    cy.location('pathname').should('eq', '/feed');
  });

  // Le filtre UX : sur trois sujets renvoyés par l'API, un seul est proposé (le seul suivi).
  it("ne propose que les sujets auxquels l'utilisateur est abonné", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');

    cy.visitAuthenticated('/articles/new');
    cy.wait('@topics');

    cy.openSelect('topicId');

    cy.get('.cdk-overlay-pane mat-option').should('have.length', 1);
    cy.get('.cdk-overlay-pane mat-option').should('contain.text', 'Java');
  });

  // Aucun abonnement : l'utilisateur est guidé plutôt que bloqué sans explication.
  it("invite à s'abonner quand aucun sujet n'est suivi", () => {
    cy.intercept(
      { method: 'GET', pathname: '/api/topics' },
      { fixture: 'topics-none-subscribed.json' },
    ).as('topics');

    cy.visitAuthenticated('/articles/new');
    cy.wait('@topics');

    cy.get('mat-hint').should('contain.text', "Abonnez-vous à un sujet");
  });

  /**
   * Le 403 est INATTEIGNABLE par l'interface, puisque le select filtre déjà les sujets non
   * suivis. On le provoque par un stub : ce test valide la défense en profondeur du front,
   * c'est-à-dire sa capacité à traduire un refus serveur en message intelligible — par exemple
   * si l'utilisateur se désabonne dans un autre onglet entre le chargement et la publication.
   */
  it("affiche un message métier quand le back refuse la publication (403)", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');
    cy.intercept({ method: 'POST', pathname: '/api/posts' }, { statusCode: 403, body: {} }).as('create');

    cy.visitAuthenticated('/articles/new');
    cy.wait('@topics');

    cy.selectOption('topicId', 'Java');
    cy.fillInput('title', 'Sealed interfaces');
    cy.fillInput('content', 'Contenu.');
    cy.get('.article-form button[type="submit"]').click();

    cy.wait('@create');
    cy.get('.article-form__error').should('contain.text', "Vous n'êtes pas abonné à ce sujet.");
    cy.location('pathname').should('eq', '/articles/new');
  });

  // Validation front : trois champs requis, aucun appel réseau.
  it("affiche les erreurs de validation et n'appelle pas l'API si le formulaire est vide", () => {
    cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');
    cy.intercept({ method: 'POST', pathname: '/api/posts' }).as('create');

    cy.visitAuthenticated('/articles/new');
    cy.wait('@topics');

    cy.get('.article-form button[type="submit"]').click();

    cy.get('mat-error').should('have.length', 3);
    cy.get('@create.all').should('have.length', 0);
  });
});