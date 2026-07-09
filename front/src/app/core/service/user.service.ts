import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { UpdateProfileRequest } from '../../models/update-profile.model';

/**
 * Service HTTP du profil : appels bruts à `/api/me`, sans état partagé
 * (l'état vit dans le ProfileStore).
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/me';

  /**
   * Récupère le profil de l'utilisateur connecté (infos + abonnements).
   * @returns le profil (200)
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  /**
   * Met à jour le profil.
   * @param payload username + email + password (vide = inchangé)
   * @returns le profil à jour (200) ; propage 400 (invalide) / 409 (username/email pris)
   */
  updateProfile(payload: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, payload);
  }
}