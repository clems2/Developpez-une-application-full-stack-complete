/**
 * Données de création d'un article (miroir du `CreatePostRequest` back).
 * L'auteur et la date ne sont pas fournis : déterminés côté serveur.
 */
export interface CreatePostRequest {
  topicId: number;
  title: string;
  content: string;
}