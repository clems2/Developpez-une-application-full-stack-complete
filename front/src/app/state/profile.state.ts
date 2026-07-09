import { UserProfile } from '../models/user-profile.model';
import { LoadingStatus } from './loading-status';

/**
 * État du profil : le profil chargé, le statut de chargement, et l'état de mise à jour
 * (distinct, pour ne pas masquer le profil pendant l'envoi du formulaire).
 */
export interface ProfileState {
  profile: UserProfile | null;
  status: LoadingStatus;
  updateStatus: LoadingStatus;
  updateError: string | null;
}

/** État initial : aucun profil chargé. */
export const initialProfileState: ProfileState = {
  profile: null,
  status: 'empty',
  updateStatus: 'empty',
  updateError: null,
};

/** View-model consommé par la page profil. */
export interface ProfileViewModel {
  profile: UserProfile | null;
  status: LoadingStatus;
  isLoading: boolean;
  isError: boolean;
  isLoaded: boolean;
  isUpdating: boolean;
  updateError: string | null;
  updateSucceeded: boolean;
}