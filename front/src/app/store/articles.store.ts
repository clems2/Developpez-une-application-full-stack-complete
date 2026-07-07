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
import { Post } from '../models/post.model';
import { CreatePostRequest } from '../models/create-post.model';
import { ArticleCreateViewModel, initialArticlesState } from '../state/articles.state';

/** Traduit un rejet HTTP de création en message métier destiné au formulaire. */
function messageForError(error: HttpErrorResponse): string {
  switch (error.status) {
    case 403:
      return "Vous n'êtes pas abonné à ce sujet.";
    case 404:
      return 'Le sujet sélectionné est introuvable.';
    case 400:
      return 'Les données de l\'article sont invalides.';
    default:
      return "La création de l'article a échoué. Réessayez plus tard.";
  }
}

/**
 * Feature store des articles (NGRX Signal Store). Porte l'état de la **création** (status/error).
 * Orchestre ; l'appel HTTP est délégué au PostService. La navigation post-succès vit dans la
 * page (un `effect()` réagit au passage à `loaded`), pas ici. La garde d'autorisation « abonné
 * au sujet » est côté back (403) : on la mappe en message, défense en profondeur du filtre front.
 */
export const ArticlesStore = signalStore(
  { providedIn: 'root' },
  withState(initialArticlesState),
  withComputed((store) => ({
    /** View-model dérivé exposé à la page de création. */
    vm: computed<ArticleCreateViewModel>(() => ({
      status: store.status(),
      isLoading: store.status() === 'loading',
      isError: store.status() === 'error',
      error: store.error(),
    })),
    /** Vrai quand une création vient d'aboutir (déclencheur de navigation côté page). */
    isCreated: computed(() => store.status() === 'loaded'),
  })),
  withMethods((store, postService = inject(PostService)) => ({
    /**
     * Crée un article (loading → loaded/error). Sur rejet, mappe le code HTTP en message.
     * @param payload sujet + titre + contenu
     */
    create: rxMethod<CreatePostRequest>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap((payload) =>
          postService.create(payload).pipe(
            tapResponse({
              next: (_created: Post) =>
                patchState(store, { status: 'loaded', error: null }),
              error: (error: HttpErrorResponse) =>
                patchState(store, { status: 'error', error: messageForError(error) }),
            }),
          ),
        ),
      ),
    ),
    /** Réinitialise l'état (au montage de la page, pour repartir propre). */
    reset(): void {
      patchState(store, initialArticlesState);
    },
  })),
);