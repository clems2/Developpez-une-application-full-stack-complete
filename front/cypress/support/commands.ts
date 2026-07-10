/// <reference types="cypress" />

/**
 * Clé de persistance du JWT. DOIT rester alignée sur `TokenStorageService.TOKEN_KEY`.
 * Une divergence ferait échouer toutes les specs authentifiées : c'est le couplage
 * assumé (et unique) entre la suite E2E et le code applicatif.
 */
export const TOKEN_KEY = 'mdd.auth.token';

/**
 * Jeton factice. `authGuard`, `guestGuard` et `authInterceptor` ne font qu'un contrôle de
 * PRÉSENCE du token (aucun décodage côté front) : une chaîne opaque suffit à simuler une
 * session. Forger un vrai JWT signé n'apporterait rien et coupleraitles tests au secret back.
 */
export const FAKE_JWT = 'e2e.fake.jwt.token';

/**
 * Sélectionne un élément par son attribut `data-cy`.
 * Découple les tests du texte affiché et des classes internes d'Angular Material.
 */
Cypress.Commands.add('dataCy', (value: string) => cy.get(`[data-cy="${value}"]`));

/**
 * Visite une route en simulant une session active.
 *
 * Le token est posé via `onBeforeLoad`, donc AVANT le bootstrap Angular : `authGuard`
 * et le hook `onInit` de `AuthStore` le voient dès la première évaluation. Poser le token
 * après `cy.visit()` serait trop tard (le guard aurait déjà redirigé vers /login).
 *
 * @param path  route applicative (ex. '/feed')
 * @param token jeton à injecter (par défaut : jeton factice)
 */
Cypress.Commands.add('visitAuthenticated', (path: string, token: string = FAKE_JWT) =>
  cy.visit(path, {
    onBeforeLoad(win: Cypress.AUTWindow): void {
      win.localStorage.setItem(TOKEN_KEY, token);
    },
  }),
);

/**
 * Connecte l'utilisateur en traversant réellement le formulaire de login.
 * Réservé aux specs qui TESTENT le login ; ailleurs, préférer `visitAuthenticated`
 * (plus rapide, et n'ancre pas les autres specs sur l'UI d'authentification).
 *
 * @param identifier e-mail ou nom d'utilisateur
 * @param password   mot de passe
 */
Cypress.Commands.add('loginViaUi', (identifier: string, password: string) => {
  cy.visit('/login');
  cy.dataCy('login-identifier').type(identifier);
  cy.dataCy('login-password').type(password);
  cy.dataCy('login-submit').click();
});