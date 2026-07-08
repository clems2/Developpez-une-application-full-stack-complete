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
import { PostService } from '../core/service/post.service';
import { CommentService } from '../core/service/comment.service';
import { PostDetail, Comment } from '../models/post-detail.model';
import {
  ArticleDetailViewModel,
  initialArticleDetailState,
} from '../state/article-detail.state';

/** Traduit un rejet HTTP d'ajout de commentaire en message métier. */
function commentErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
      return 'Le commentaire est invalide (vide ou trop long).';
    case 404:
      return 'Article introuvable.';
    default:
      return "L'ajout du commentaire a échoué. Réessayez plus tard.";
  }
}

/**
 * Feature store du détail d'un article (NGRX Signal Store). Charge un article par id avec ses
 * commentaires, et gère l'ajout de commentaire (append local du commentaire renvoyé par le
 * serveur — mutation ciblée immutable, pas de rechargement). Orchestre ; I/O déléguée aux
 * services Post/Comment.
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
      isSubmittingComment: store.commentStatus() === 'loading',
      commentError: store.commentError(),
    })),
  })),
  withMethods((store, postService = inject(PostService), commentService = inject(CommentService)) => ({
    /**
     * Charge le détail d'un article par id (loading → loaded/error). 404 → error.
     * @param id identifiant de l'article
     */
    loadDetail: rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, {
            status: 'loading',
            post: null,
            commentStatus: 'empty',
            commentError: null,
          }),
        ),
        switchMap((id) =>
          postService.getById(id).pipe(
            tapResponse({
              next: (post: PostDetail) => patchState(store, { post, status: 'loaded' }),
              error: () => patchState(store, { post: null, status: 'error' }),
            }),
          ),
        ),
      ),
    ),
    /**
     * Ajoute un commentaire à l'article courant, puis l'append à la liste en état (le back
     * renvoie un CommentDto complet). Statut d'envoi distinct du chargement de l'article.
     * @param payload id de l'article + contenu
     */
    addComment: rxMethod<{ postId: number; content: string }>(
      pipe(
        tap(() => patchState(store, { commentStatus: 'loading', commentError: null })),
        switchMap(({ postId, content }) =>
          commentService.create(postId, { content }).pipe(
            tapResponse({
              next: (created: Comment) => {
                const current = store.post();
                patchState(store, {
                  commentStatus: 'loaded',
                  post: current
                    ? { ...current, comments: [...current.comments, created] }
                    : current,
                });
              },
              error: (error: HttpErrorResponse) =>
                patchState(store, {
                  commentStatus: 'error',
                  commentError: commentErrorMessage(error),
                }),
            }),
          ),
        ),
      ),
    ),
  })),
);