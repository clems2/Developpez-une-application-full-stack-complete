import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../models/post.model';
import { CreatePostRequest } from '../../models/create-post.model';

/**
 * Service HTTP des articles : appels bruts à l'API, sans état partagé
 * (l'état vit dans l'ArticlesStore). Base pour le détail/la liste à venir.
 */
@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/posts';

  /**
   * Crée un article pour l'utilisateur courant.
   * @param payload sujet (topicId), titre et contenu
   * @returns l'article créé (201) ; propage l'erreur HTTP (400/403/404)
   */
  create(payload: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, payload);
  }
}