import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Topic } from '../../models/topic.model';

/**
 * Service HTTP des sujets : appels bruts à l'API, sans état partagé
 * (l'état vit dans le store NGRX).
 */
@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/topics';

  /**
   * Récupère la liste de tous les sujets.
   *
   * @returns un flux émettant le tableau des sujets
   */
  getAll(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.apiUrl);
  }
}