import { LoadingStatus } from './loading-status';

/**
 * État du domaine d'authentification, porté par le AuthStore (Signal Store).
 * - `token`  : JWT courant, `null` si non authentifié (hydraté depuis le storage à l'init du store).
 * - `status` : phase du flux auth (login/register) pour piloter l'UI.
 * - `error`  : message métier (ex. 401 mauvais identifiants) destiné au formulaire.
 */
export interface AuthState {
  token: string | null;
  status: LoadingStatus;
  error: string | null;
}

/** État initial : aucune session active. */
export const initialAuthState: AuthState = {
  token: null,
  status: 'empty',
  error: null,
};

/**
 * View-model consommé par les pages login/register : statut brut + drapeaux dérivés
 * pour piloter l'affichage (spinner, message d'erreur) sans logique dans le template.
 */
export interface AuthViewModel {
  status: LoadingStatus;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isAuthenticated: boolean;
}