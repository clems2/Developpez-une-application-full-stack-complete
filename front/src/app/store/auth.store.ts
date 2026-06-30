import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {patchState, signalStore, withComputed, withHooks, withMethods, withState} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthService } from '../core/service/auth.service';
import { TokenStorageService } from '../core/service/token-storage.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { AuthViewModel, initialAuthState } from '../state/auth.state';

/**
 * Feature store d'authentification (NGRX Signal Store).
 *
 * Source de vérité de l'état réactif d'auth (token/status/error). Le store orchestre ;
 * l'appel HTTP est délégué à AuthService, la persistance du token à TokenStorageService.
 * Aucune navigation ici (la page login redirige sur succès).
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withComputed((store) => ({
    /** Session active si un token est présent. */
    isAuthenticated: computed(() => store.token() !== null),
    /** View-model dérivé exposé aux pages login/register. */
    vm: computed<AuthViewModel>(() => ({
      status: store.status(),
      isLoading: store.status() === 'loading',
      isError: store.status() === 'error',
      error: store.error(),
      isAuthenticated: store.token() !== null,
    })),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      tokenStorage = inject(TokenStorageService),
    ) => ({
      /**
       * Authentifie l'utilisateur (loading → loaded/error). Sur succès : persiste le
       * token et l'expose dans l'état. Le cycle de l'abonnement est géré par `rxMethod`.
       */
      login: rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { status: 'loading', error: null })),
          switchMap((payload) =>
            authService.login(payload).pipe(
              tapResponse({
                next: (res: AuthResponse) => {
                  tokenStorage.setToken(res.token);
                  patchState(store, { token: res.token, status: 'loaded', error: null });
                },
                error: () =>
                  patchState(store, {
                    status: 'error',
                    error: 'Identifiant ou mot de passe incorrect.',
                  }),
              }),
            ),
          ),
        ),
      ),
      /**
       * Inscrit l'utilisateur (loading → loaded/error). Sur succès : persiste le token
       * et l'expose dans l'état.
       */
      register: rxMethod<RegisterRequest>(
        pipe(
          tap(() => patchState(store, { status: 'loading', error: null })),
          switchMap((payload) =>
            authService.register(payload).pipe(
              tapResponse({
                next: (res: AuthResponse) => {
                  tokenStorage.setToken(res.token);
                  patchState(store, { token: res.token, status: 'loaded', error: null });
                },
                error: () =>
                  patchState(store, {
                    status: 'error',
                    error: 'La création du compte a échoué (identifiant ou email déjà utilisé ?).',
                  }),
              }),
            ),
          ),
        ),
      ),
      /** Déconnexion : purge le token (storage + état). */
      logout(): void {
        tokenStorage.clear();
        patchState(store, { token: null, status: 'empty', error: null });
      },
    }),
  ),
  withHooks((store) => {
    const tokenStorage = inject(TokenStorageService);
    return {
      /** Hydrate l'état depuis le token persistant au démarrage (rafraîchissement d'onglet). */
      onInit(): void {
        const token = tokenStorage.getToken();
        if (token !== null) {
          patchState(store, { token, status: 'loaded' });
        }
      },
    };
  }),
);