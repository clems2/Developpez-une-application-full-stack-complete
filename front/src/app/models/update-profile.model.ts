/**
 * Corps de mise à jour du profil (miroir du `UpdateProfileRequest` back).
 * `username` et `email` toujours fournis ; `password` optionnel (vide = inchangé).
 */
export interface UpdateProfileRequest {
  username: string;
  email: string;
  password: string;
}