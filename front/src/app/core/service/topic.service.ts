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
   * @returns un flux émettant le tableau des sujets
   */
  getAll(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.apiUrl);
  }

  /**
   * Abonne l'utilisateur courant au sujet (idempotent côté back).
   * @param topicId identifiant du sujet
   * @returns un flux se complétant à la confirmation serveur (200)
   */
  subscribe(topicId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${topicId}/subscribe`, {});
  }

  /**
   * Désabonne l'utilisateur courant du sujet (idempotent côté back).
   * Réservé au slice profil (specs), fourni ici par symétrie du service.
   * @param topicId identifiant du sujet
   */
  unsubscribe(topicId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${topicId}/subscribe`);
  }
}