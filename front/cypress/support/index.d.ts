/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /** Visite une route avec un JWT pré-posé dans `localStorage` (session simulée). */
      visitAuthenticated(path: string, token?: string): Chainable<AUTWindow>;

      /** Saisit une valeur dans le champ Material portant ce `formControlName`. */
      fillInput(formControlName: string, value: string): Chainable<JQuery<HTMLElement>>;

      /** Ouvre le `mat-select` portant ce `formControlName` et choisit l'option donnée. */
      selectOption(formControlName: string, optionLabel: string): Chainable<JQuery<HTMLElement>>;

      /** Ouvre le `mat-select` portant ce `formControlName`, sans sélectionner. */
      openSelect(formControlName: string): Chainable<JQuery<HTMLElement>>;

      /** Connecte l'utilisateur via le formulaire de login réel. */
      loginViaUi(identifier: string, password: string): Chainable<void>;
    }
  }
}

export {};