import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../core/service/token-storage.service';

/** Préfixe des endpoints d'auth : ni Bearer ajouté, ni 401 intercepté (le flux login gère son erreur). */
const AUTH_URL_PREFIX = '/api/auth';

/**
 * Intercepteur JWT (fonctionnel).
 * - Ajoute `Authorization: Bearer <token>` sur les requêtes sortantes, SAUF `/api/auth/**`.
 * - Sur 401 hors `/api/auth/**` (session expirée) : purge le token et redirige vers /login.
 *   Le 401 d'un login échoué n'est PAS traité ici → il remonte au store qui en fait un message.
 * Lit le token via TokenStorageService (et non le store) pour éviter un cycle DI avec HttpClient.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const isAuthEndpoint = req.url.startsWith(AUTH_URL_PREFIX);
  const token = tokenStorage.getToken();

  const authReq =
    token !== null && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        tokenStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};