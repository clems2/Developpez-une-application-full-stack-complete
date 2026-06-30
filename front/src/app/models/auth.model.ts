/**
 * Corps de la requête de connexion.
 * `identifier` accepte l'email OU le username (le back résout les deux via
 * findByEmail().or(findByUsername()) — d'où un nom volontairement neutre).
 */
export interface LoginRequest {
  identifier: string;
  password: string;
}

/** Corps de la requête d'inscription. */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Réponse d'authentification de /api/auth/login et /api/auth/register.
 * Le back ne renvoie que le JWT ; les infos profil viennent ensuite de /api/me.
 */
export interface AuthResponse {
  token: string;
}