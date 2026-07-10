/// <reference types="cypress" />

import { FAKE_JWT, TOKEN_KEY } from './constants';

/**
 * Visite une route en simulant une session active.
 *
 * Le token est posé via `onBeforeLoad`, donc AVANT le bootstrap Angular : `authGuard` et le
 * hook `onInit` de `AuthStore` le voient dès la première évaluation. Le poser après
 * `cy.visit()` serait trop tard — le guard aurait déjà redirigé vers /login.
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
 * Saisit une valeur dans un champ Angular Material, désigné par son `formControlName`.
 *
 * Le `.focus()` préalable n'est pas cosmétique. Avec `appearance="outline"`, tant que le champ
 * est vide et non focalisé, le `<mat-label>` recouvre le centre de l'input : `cy.type()` échoue
 * alors ses contrôles d'actionnabilité (« is being covered by another element »). Le focus fait
 * remonter le label — c'est la séquence exacte d'un utilisateur qui clique puis tape.
 *
 * `.focus()` ne réalisant aucun contrôle d'actionnabilité, on obtient ce résultat SANS recourir
 * à `{ force: true }`, qui désactiverait aussi la détection des vrais éléments inaccessibles.
 *
 * Fonctionne pour `<input>` comme pour `<textarea>`.
 *
 * @param formControlName nom du contrôle dans le FormGroup
 * @param value           valeur à saisir (le champ est vidé au préalable)
 */
Cypress.Commands.add('fillInput', (formControlName: string, value: string) => {
  cy.get(`[formControlName="${formControlName}"]`).focus().clear().type(value);
});

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
  cy.fillInput('identifier', identifier);
  cy.fillInput('password', password);
  cy.get('.auth-card button[type="submit"]').click();
});