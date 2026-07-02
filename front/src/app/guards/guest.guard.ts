import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../core/service/token-storage.service';

/**
 * Guard « invité » (fonctionnel) : réserve les routes publiques (accueil, login, register)
 * aux utilisateurs NON authentifiés. Si un token est présent, redirige vers /feed avant tout
 * rendu (pas de flash de la page publique). Miroir de `authGuard` : contrôle de présence du
 * token uniquement — lit `TokenStorageService` (pas le store) pour rester découplé et cohérent
 * avec l'intercepteur/authGuard.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  return tokenStorage.getToken() === null ? true : router.createUrlTree(['/feed']);
};