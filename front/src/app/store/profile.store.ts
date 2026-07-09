import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { UserService } from '../core/service/user.service';
import { TopicService } from '../core/service/topic.service';
import { UserProfile } from '../models/user-profile.model';
import { UpdateProfileRequest } from '../models/update-profile.model';
import { ProfileViewModel, initialProfileState } from '../state/profile.state';

/** Traduit un rejet HTTP de mise à jour de profil en message métier. */
function updateErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 409:
      return "Ce nom d'utilisateur ou cet e-mail est déjà utilisé.";
    case 400:
      return 'Données invalides (vérifiez l\'e-mail et la règle du mot de passe).';
    default:
      return 'La mise à jour du profil a échoué. Réessayez plus tard.';
  }
}

/**
 * Feature store du profil (NGRX Signal Store). Charge le profil (infos + abonnements), gère
 * sa mise à jour et le désabonnement d'un sujet (retrait immutable de la liste). Orchestre ;
 * I/O déléguée aux services User/Topic. La déconnexion post-update est décidée côté page.
 */
export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState(initialProfileState),
  withComputed((store) => ({
    /** View-model dérivé exposé à la page profil. */
    vm: computed<ProfileViewModel>(() => ({
      profile: store.profile(),
      status: store.status(),
      isLoading: store.status() === 'loading',
      isError: store.status() === 'error',
      isLoaded: store.status() === 'loaded',
      isUpdating: store.updateStatus() === 'loading',
      updateError: store.updateError(),
      updateSucceeded: store.updateStatus() === 'loaded',
    })),
  })),
  withMethods((store, userService = inject(UserService), topicService = inject(TopicService)) => ({
    /** Charge le profil de l'utilisateur (loading → loaded/error). */
    loadProfile: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading', updateStatus: 'empty', updateError: null })),
        switchMap(() =>
          userService.getProfile().pipe(
            tapResponse({
              next: (profile: UserProfile) => patchState(store, { profile, status: 'loaded' }),
              error: () => patchState(store, { profile: null, status: 'error' }),
            }),
          ),
        ),
      ),
    ),
    /**
     * Met à jour le profil (updateStatus loading → loaded/error). Sur succès, `updateSucceeded`
     * passe à vrai → la page déclenche la déconnexion (le username = sujet du JWT).
     * @param payload nouvelles valeurs (password vide = inchangé)
     */
    updateProfile: rxMethod<UpdateProfileRequest>(
      pipe(
        tap(() => patchState(store, { updateStatus: 'loading', updateError: null })),
        switchMap((payload) =>
          userService.updateProfile(payload).pipe(
            tapResponse({
              next: (profile: UserProfile) =>
                patchState(store, { profile, updateStatus: 'loaded' }),
              error: (error: HttpErrorResponse) =>
                patchState(store, {
                  updateStatus: 'error',
                  updateError: updateErrorMessage(error),
                }),
            }),
          ),
        ),
      ),
    ),
    /**
     * Désabonne l'utilisateur d'un sujet, puis retire le sujet de la liste en état
     * (mutation immutable, pas de rechargement). Désabonnement réservé au profil (specs).
     * @param topicId identifiant du sujet à quitter
     */
    unsubscribe: rxMethod<number>(
      pipe(
        switchMap((topicId) =>
          topicService.unsubscribe(topicId).pipe(
            tapResponse({
              next: () => {
                const current = store.profile();
                if (current) {
                  patchState(store, {
                    profile: {
                      ...current,
                      subscriptions: current.subscriptions.filter((t) => t.id !== topicId),
                    },
                  });
                }
              },
              error: () => patchState(store, { status: 'error' }),
            }),
          ),
        ),
      ),
    ),
  })),
);