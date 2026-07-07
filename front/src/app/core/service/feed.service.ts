import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, FeedOrder } from '../../models/post.model';

/**
 * Service HTTP du fil d'actualité : appel brut à l'API, sans état partagé
 * (l'état vit dans le FeedStore).
 */
@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/feed';

  /**
   * Récupère le fil de l'utilisateur courant, trié par date.
   * @param order sens de tri ("asc" ou "desc")
   * @returns un flux émettant la liste des articles (vide si aucun abonnement)
   */
  getFeed(order: FeedOrder): Observable<Post[]> {
    const params = new HttpParams().set('order', order);
    return this.http.get<Post[]>(this.apiUrl, { params });
  }
}