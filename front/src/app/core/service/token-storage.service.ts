import { Injectable } from '@angular/core';

/**
 * Persistance du JWT.
 *
 * Choix acté (doc de décisions) : stockage en `localStorage` → le token survit au
 * rafraîchissement de l'onglet (persistance inter-session). Toute lecture/écriture du token passe par ce service
 * aucun accès direct à `localStorage` ailleurs (SRP + point unique à durcir si besoin).
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  /** Clé namespacée pour éviter les collisions de stockage. */
  private static readonly TOKEN_KEY = 'mdd.auth.token';

  /** Retourne le JWT stocké, ou `null` si aucune session. */
  getToken(): string | null {
    return localStorage.getItem(TokenStorageService.TOKEN_KEY);
  }

  /** Enregistre (ou remplace) le JWT courant. */
  setToken(token: string): void {
    localStorage.setItem(TokenStorageService.TOKEN_KEY, token);
  }

  /** Purge le JWT (déconnexion ou 401). */
  clear(): void {
    localStorage.removeItem(TokenStorageService.TOKEN_KEY);
  }
}