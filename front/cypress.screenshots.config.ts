import { defineConfig } from 'cypress';

/**
 * Configuration dédiée à la GÉNÉRATION DES CAPTURES D'INTERFACE (annexes du dossier).
 *
 * Volontairement séparée de `cypress.config.ts` : les captures ne sont pas des tests. Elles
 * n'assertent rien, ne doivent pas peser sur le rapport de la suite E2E, ni être rejouées en
 * CI. Le `specPattern` pointe vers `cypress/ui-capture/`, hors du périmètre de `cypress/e2e/`.
 *
 * Comme la suite E2E, tous les appels `/api/**` sont stubbés : aucun back-end n'est requis, et
 * les captures ne contiennent aucune donnée personnelle réelle (utile pour l'étape conformité).
 *
 * `trashAssetsBeforeRuns` vide `docs/captures` avant chaque exécution : le dossier reflète
 * toujours l'état courant de l'interface, jamais un mélange d'anciennes et de nouvelles images.
 */
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/ui-capture/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: '../docs/captures',
    trashAssetsBeforeRuns: true,
    video: false,
    // Aucune reprise : une capture qui échoue doit être vue, pas retentée en silence.
    retries: 0,
  },
});