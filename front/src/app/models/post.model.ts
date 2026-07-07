/**
 * Article exposé par l'API (`GET /api/feed`), forme plate du `PostDto` back :
 * `author` = nom d'utilisateur de l'auteur, `topic` = titre du sujet.
 * `createdAt` est une chaîne ISO (LocalDateTime sérialisé), parsée à l'affichage.
 */
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  topic: string;
}

/** Sens de tri du fil par date. */
export type FeedOrder = 'asc' | 'desc';