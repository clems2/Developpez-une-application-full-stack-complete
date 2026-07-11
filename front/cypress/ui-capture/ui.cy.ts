/**
 * Génération des captures d'interface pour les annexes du dossier technique.
 *
 * Ce fichier ne contient AUCUNE assertion : ce ne sont pas des tests. Il parcourt les neuf
 * écrans de la maquette sous trois largeurs et produit une image par combinaison.
 *
 * Reproductible : les données proviennent de fixtures, jamais d'une base. Une modification
 * de l'interface se répercute sur les annexes par une simple relance de `npm run capture:ui`.
 */

/** Une largeur cible, nommée pour apparaître dans le nom du fichier produit. */
interface Viewport {
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Les trois cibles nommées par la maquette (« ordinateur, tablette et téléphone »).
 * 768px déclenche le mode compact (@media max-width: 768px) : la tablette illustre donc
 * le header en burger et les grilles à une colonne, comme prévu par le modèle responsive.
 */
const VIEWPORTS: readonly Viewport[] = [
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'tablette', width: 768, height: 1024 },
  { label: 'mobile', width: 390, height: 844 },
];

/** Stubbe l'ensemble des appels API avec les fixtures de capture. */
function stubApi(): void {
  cy.intercept({ method: 'GET', pathname: '/api/feed' }, { fixture: 'feed-full.json' }).as('feed');
  cy.intercept({ method: 'GET', pathname: '/api/topics' }, { fixture: 'topics.json' }).as('topics');
  cy.intercept({ method: 'GET', pathname: '/api/posts/10' }, { fixture: 'post-detail.json' }).as('detail');
  cy.intercept({ method: 'GET', pathname: '/api/me' }, { fixture: 'profile-full.json' }).as('profile');
}

/**
 * Capture la page entière (et non le seul viewport) : une page longue tient sur une image.
 * `overwrite` évite les suffixes numériques en cas de relance sans nettoyage préalable.
 */
function shoot(name: string, viewport: Viewport): void {
  cy.screenshot(`${name}-${viewport.label}`, { capture: 'fullPage', overwrite: true });
}

VIEWPORTS.forEach((viewport) => {
  describe(`Captures d'interface — ${viewport.label}`, () => {
    beforeEach(() => {
      cy.viewport(viewport.width, viewport.height);
      stubApi();
    });

    it('accueil', () => {
      cy.visit('/');
      cy.contains('a', 'Se connecter').should('be.visible');
      shoot('01-accueil', viewport);
    });

    it('inscription', () => {
      cy.visit('/register');
      cy.contains('h1', 'Inscription').should('be.visible');
      shoot('02-inscription', viewport);
    });

    it('connexion', () => {
      cy.visit('/login');
      cy.contains('h1', 'Se connecter').should('be.visible');
      shoot('03-connexion', viewport);
    });

    it("fil d'actualité", () => {
      cy.visitAuthenticated('/feed');
      cy.wait('@feed');
      cy.get('.article-card').should('have.length', 4);
      shoot('04-fil', viewport);
    });

    it('thèmes', () => {
      cy.visitAuthenticated('/topics');
      cy.wait('@topics');
      cy.get('.topic-card').should('have.length', 3);
      shoot('05-themes', viewport);
    });

    it("détail d'un article", () => {
      cy.visitAuthenticated('/articles/10');
      cy.wait('@detail');
      cy.get('.detail__title').should('be.visible');
      shoot('06-article-detail', viewport);
    });

    it("création d'un article", () => {
      cy.visitAuthenticated('/articles/new');
      cy.wait('@topics');
      cy.contains('h1', 'Créer un nouvel article').should('be.visible');
      shoot('07-article-creation', viewport);
    });

    it('profil', () => {
      cy.visitAuthenticated('/me');
      cy.wait('@profile');
      cy.get('.subscription').should('have.length', 2);
      shoot('08-profil', viewport);
    });

    /**
     * Le menu burger n'existe qu'en mode compact (@media max-width: 768px). En desktop, le
     * bouton est masqué par le CSS : le capturer produirait une image identique à `04-fil`.
     */
    if (viewport.width <= 768) {
      it('menu burger ouvert', () => {
        cy.visitAuthenticated('/feed');
        cy.wait('@feed');
        cy.get('.header__burger').click();
        cy.get('.header__nav--open').should('be.visible');
        shoot('09-menu-burger', viewport);
      });
    }
  });
});