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
import { FeedService } from '../core/service/feed.service';
import { Post, FeedOrder } from '../models/post.model';
import { FeedViewModel, initialFeedState } from '../state/feed.state';

/**
 * Feature store du fil d'actualité (NGRX Signal Store).
 *
 * Orchestre ; l'appel HTTP est délégué au FeedService. Le tri (`order`) est un état local
 * au fil : le changer déclenche un rechargement serveur (le back trie). Pas d'effet de bord
 * dans les `computed`.
 */
export const FeedStore = signalStore(
  { providedIn: 'root' },
  withState(initialFeedState),
  withComputed((store) => ({
    /** View-model dérivé exposé à la page. */
    vm: computed<FeedViewModel>(() => ({
      posts: store.posts(),
      status: store.status(),
      order: store.order(),
      isLoading: store.status() === 'loading',
      isError: store.status() === 'error',
      isEmpty: store.status() === 'loaded' && store.posts().length === 0,
    })),
  })),
  withMethods((store, feedService = inject(FeedService)) => ({
    /**
     * Charge le fil selon le tri courant (loading → loaded/error).
     * Le cycle de vie de l'abonnement est géré par `rxMethod`.
     */
    loadFeed: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap(() =>
          feedService.getFeed(store.order()).pipe(
            tapResponse({
              next: (posts: Post[]) =>
                patchState(store, { posts, status: 'loaded' }),
              error: () => patchState(store, { posts: [], status: 'error' }),
            }),
          ),
        ),
      ),
    ),
    /**
     * Change le sens de tri et recharge le fil. Idempotent si l'ordre ne change pas.
     * @param order nouveau sens de tri
     */
    setOrder: rxMethod<FeedOrder>(
      pipe(
        tap((order) => patchState(store, { order, status: 'loading' })),
        switchMap((order) =>
          feedService.getFeed(order).pipe(
            tapResponse({
              next: (posts: Post[]) =>
                patchState(store, { posts, status: 'loaded' }),
              error: () => patchState(store, { posts: [], status: 'error' }),
            }),
          ),
        ),
      ),
    ),
  })),
);