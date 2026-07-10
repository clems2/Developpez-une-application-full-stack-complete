/**
 * Constantes partagées par les specs. Fichier sans effet de bord : importable depuis une
 * spec sans déclencher l'enregistrement des commandes Cypress.
 */

/**
 * Clé de persistance du JWT. DOIT rester alignée sur `TokenStorageService.TOKEN_KEY`.
 * C'est le seul couplage entre la suite E2E et le code applicatif.
 */
export const TOKEN_KEY = 'mdd.auth.token';

/**
 * Jeton factice. `authGuard`, `guestGuard` et `authInterceptor` ne font qu'un contrôle de
 * PRÉSENCE du token (aucun décodage côté front) : une chaîne opaque suffit à simuler une
 * session. Forger un vrai JWT signé n'apporterait rien et coupleraitles tests au secret back.
 */
export const FAKE_JWT = 'e2e.fake.jwt.token';