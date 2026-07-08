import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../../models/post-detail.model';
import { CreateCommentRequest } from '../../models/create-comment.model';

/**
 * Service HTTP des commentaires (sous-ressource d'un article) : appels bruts,
 * sans état partagé (l'état vit dans l'ArticleDetailStore).
 */
@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);

  /**
   * Ajoute un commentaire à un article.
   * @param postId  article commenté
   * @param payload contenu du commentaire
   * @returns le commentaire créé (201) ; propage 400 (invalide) / 404 (article introuvable)
   */
  create(postId: number, payload: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`/api/posts/${postId}/comments`, payload);
  }
}