import { computed, inject } from '@angular/core';
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
import { TopicService } from '../core/service/topic.service';
import { Topic } from '../models/topic.model';
import { initialTopicsState, TopicsViewModel } from '../state/topics.state';

/**
 * Feature store des sujets (NGRX Signal Store).
 *
 * Orchestre ; l'appel HTTP est délégué au TopicService. La navigation et les effets de bord ne
 * vivent pas dans les `computed`.
 */
export const TopicsStore = signalStore(
  { providedIn: 'root' },
  withState(initialTopicsState),
  withComputed((store) => ({
    /** View-model dérivé exposé à la page (statut + drapeaux d'affichage). */
    vm: computed<TopicsViewModel>(() => ({
      topics: store.topics(),
      status: store.status(),
      isLoading: store.status() === 'loading',
      isError: store.status() === 'error',
      isEmpty: store.status() === 'loaded' && store.topics().length === 0,
    })),
  })),
  withMethods((store, topicService = inject(TopicService)) => ({
    /**
     * Charge les sujets depuis l'API et met à jour l'état (loading → loaded/error).
     * Le cycle de vie de l'abonnement est géré par `rxMethod`.
     */
    loadTopics: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap(() =>
          topicService.getAll().pipe(
            tapResponse({
              next: (topics: Topic[]) =>
                patchState(store, { topics, status: 'loaded' }),
              error: () => patchState(store, { topics: [], status: 'error' }),
            }),
          ),
        ),
      ),
    ),
    /**
     * Abonne l'utilisateur au sujet, puis passe son flag `subscribed` à true (après
     * confirmation serveur — décision N=a). Idempotent côté back. Ne recharge pas toute
     * la liste : mutation ciblée du seul sujet concerné.
     * @param topicId identifiant du sujet à suivre
     */
    subscribe: rxMethod<number>(
      pipe(
        switchMap((topicId) =>
          topicService.subscribe(topicId).pipe(
            tapResponse({
              next: () =>
                patchState(store, {
                  topics: store
                    .topics()
                    .map((t) => (t.id === topicId ? { ...t, subscribed: true } : t)),
                }),
              error: () => patchState(store, { status: 'error' }),
            }),
          ),
        ),
      ),
    ),
  })),
);