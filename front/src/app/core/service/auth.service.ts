import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/auth.model';

/**
 * Appels HTTP bruts d'authentification. Pas d'état partagé ici : le service fait l'I/O, le AuthStore orchestre (via `rxMethod`) et porte
 * l'état.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** Préfixe des endpoints d'auth (exclus du Bearer par l'intercepteur, commit 2). */
  private static readonly BASE_URL = '/api/auth';

  /**
   * Authentifie un utilisateur.
   * @param payload identifiant (email ou username) + mot de passe
   * @returns le JWT en cas de succès ; propage l'erreur HTTP (401 si mauvais identifiants)
   */
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AuthService.BASE_URL}/login`, payload);
  }

  /**
   * Inscrit un nouvel utilisateur.
   * @param payload username + email + mot de passe
   * @returns le JWT en cas de succès (201) ; propage l'erreur HTTP (409 si conflit)
   */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AuthService.BASE_URL}/register`, payload);
  }
}