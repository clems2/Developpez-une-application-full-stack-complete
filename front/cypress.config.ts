import { defineConfig } from 'cypress';

/**
 * Configuration Cypress (E2E).
 *
 * Stratégie d'isolation : TOUS les appels `/api/**` sont stubbés par `cy.intercept`
 * dans les specs. `cy.intercept` agit dans le navigateur, avant que la requête ne parte :
 * le `proxy.conf.json` d'Angular n'est jamais sollicité. La suite tourne donc sans
 * back-end ni MySQL — déterministe, rapide, rejouable en CI.
 *
 * La couverture de lignes n'est PAS instrumentée ici (décision actée) : Cypress atteste
 * des parcours ; la couverture chiffrée ≥ 70 % est portée par Jest (front) et JaCoCo (back).
 */
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    // Aucun retry en mode interactif : un test rouge doit rester rouge sous les yeux du dev.
    // En CI, 2 tentatives absorbent les aléas d'animation Material sans masquer un vrai échec.
    retries: { runMode: 2, openMode: 0 },
  },
});