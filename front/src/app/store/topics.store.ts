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
 * orchestre ; l'appel HTTP est délégué au TopicService. La navigation et les effets de bord ne
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
  })),
);