/**
 * Parcours du détail d'un article : lecture, commentaires (liste et ajout), états d'erreur.
 *
 * L'`id` provient de la route (`withComponentInputBinding`) : visiter directement
 * `/articles/10` suffit à déclencher le chargement, sans passer par le fil.
 */
describe("Détail d'un article", () => {
  // Lecture : l'article et ses commentaires existants sont rendus.
  it("affiche l'article et ses commentaires", () => {
    cy.intercept({ method: 'GET', pathname: '/api/posts/10' }, { fixture: 'post-detail.json' }).as(
      'detail',
    );

    cy.visitAuthenticated('/articles/10');
    cy.wait('@detail');

    cy.get('.detail__title').should('contain.text', 'Les records en Java 21');
    cy.get('.detail__content').should('contain.text', 'porteur de données immuable');
    cy.get('.detail__topic').should('contain.text', 'Java');
    cy.contains('h2', 'Commentaires (1)').should('be.visible');
    cy.get('.comment').should('have.length', 1).and('contain.text', 'bob');
  });

  /**
   * Ajout d'un commentaire. Trois assertions au-delà du rendu :
   * - le champ est vidé,
   * - le `mat-form-field` n'est PAS laissé en état d'erreur (non-régression du bug corrigé
   *   par `FormGroupDirective.resetForm()` : `reset()` seul ne remettait pas `submitted` à
   *   zéro, et Material laissait le champ rouge),
   * - le compteur est incrémenté sans rechargement de l'article (mutation locale du store).
   */
  it('ajoute un commentaire, le rend, et laisse le formulaire propre', () => {
    cy.intercept({ method: 'GET', pathname: '/api/posts/10' }, { fixture: 'post-detail.json' }).as(
      'detail',
    );
    cy.intercept(
      { method: 'POST', pathname: '/api/posts/10/comments' },
      { statusCode: 201, fixture: 'comment-created.json' },
    ).as('addComment');

    cy.visitAuthenticated('/articles/10');
    cy.wait('@detail');

    cy.fillInput('content', 'Le pattern matching complète bien les records.');
    cy.get('.comment-form button[type="submit"]').click();

    cy.wait('@addComment')
      .its('request.body')
      .should('deep.equal', { content: 'Le pattern matching complète bien les records.' });

    cy.get('.comment').should('have.length', 2);
    cy.contains('h2', 'Commentaires (2)').should('be.visible');
    cy.get('.comment').last().should('contain.text', 'Le pattern matching complète bien');

    cy.get('[formControlName="content"]').should('have.value', '');
    cy.get('.comment-form__field').should('not.have.class', 'mat-form-field-invalid');

    // Une seule requête de détail : le commentaire est ajouté à l'état, pas rechargé.
    cy.get('@detail.all').should('have.length', 1);
  });

  // Validation : un commentaire vide n'atteint pas le réseau.
  it("refuse un commentaire vide sans appeler l'API", () => {
    cy.intercept({ method: 'GET', pathname: '/api/posts/10' }, { fixture: 'post-detail.json' }).as(
      'detail',
    );
    cy.intercept({ method: 'POST', pathname: '/api/posts/10/comments' }).as('addComment');

    cy.visitAuthenticated('/articles/10');
    cy.wait('@detail');

    cy.get('.comment-form button[type="submit"]').click();

    cy.get('mat-error').should('contain.text', 'ne peut pas être vide');
    cy.get('@addComment.all').should('have.length', 0);
  });

  // Rejet serveur du commentaire : message dédié, sous le formulaire.
  it("affiche un message d'erreur quand l'ajout du commentaire est rejeté", () => {
    cy.intercept({ method: 'GET', pathname: '/api/posts/10' }, { fixture: 'post-detail.json' }).as(
      'detail',
    );
    cy.intercept({ method: 'POST', pathname: '/api/posts/10/comments' }, {
      statusCode: 400,
      fixture: 'error-server.json',
    }).as('addComment');

    cy.visitAuthenticated('/articles/10');
    cy.wait('@detail');

    cy.fillInput('content', 'Un commentaire refusé.');
    cy.get('.comment-form button[type="submit"]').click();

    cy.wait('@addComment');
    cy.get('.comment-form .detail__error').should('contain.text', 'Le commentaire est invalide');

    // Le texte saisi est préservé : l'utilisateur peut corriger sans tout retaper.
    cy.get('[formControlName="content"]').should('have.value', 'Un commentaire refusé.');
  });

  // Article inexistant : message d'erreur, pas de page blanche.
  it("affiche un message d'erreur quand l'article est introuvable", () => {
    cy.intercept({ method: 'GET', pathname: '/api/posts/99' }, {
      statusCode: 404,
      fixture: 'error-server.json',
    }).as('detail');

    cy.visitAuthenticated('/articles/99');
    cy.wait('@detail');

    cy.get('.detail__error').should('contain.text', 'Article introuvable');
    cy.get('.detail__article').should('not.exist');
  });
});