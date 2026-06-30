import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../core/service/token-storage.service';

/**
 * Guard d'authentification (fonctionnel). Autorise la route si un token est présent,
 * sinon redirige vers /login (renvoie un UrlTree). Contrôle de **présence** uniquement :
 * la validité réelle du JWT est vérifiée côté serveur ; un token expiré déclenchera un
 * 401 pris en charge par l'intercepteur.
 */
export const authGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  return tokenStorage.getToken() !== null ? true : router.createUrlTree(['/login']);
};