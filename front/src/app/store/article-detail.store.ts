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
import { PostService } from '../core/service/post.service';
import { PostDetail } from '../models/post-detail.model';
import {
  ArticleDetailViewModel,
  initialArticleDetailState,
} from '../state/article-detail.state';

/**
 * Feature store du détail d'un article (NGRX Signal Store). Charge un article par id avec
 * ses commentaires (lecture). Orchestre ; l'appel HTTP est délégué au PostService.
 */
export const ArticleDetailStore = signalStore(
  { providedIn: 'root' },
  withState(initialArticleDetailState),
  withComputed((store) => ({
    /** View-model dérivé exposé à la page détail. */
    vm: computed<ArticleDetailViewModel>(() => ({
      post: store.post(),
      status: store.status(),
      isLoading: store.status() === 'loading',
      isError: store.status() === 'error',
      isLoaded: store.status() === 'loaded',
    })),
  })),
  withMethods((store, postService = inject(PostService)) => ({
    /**
     * Charge le détail d'un article par id (loading → loaded/error).
     * Une erreur (404 inclus) place le statut en `error`.
     * @param id identifiant de l'article
     */
    loadDetail: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { status: 'loading', post: null })),
        switchMap((id) =>
          postService.getById(id).pipe(
            tapResponse({
              next: (post: PostDetail) =>
                patchState(store, { post, status: 'loaded' }),
              error: () => patchState(store, { post: null, status: 'error' }),
            }),
          ),
        ),
      ),
    ),
  })),
);