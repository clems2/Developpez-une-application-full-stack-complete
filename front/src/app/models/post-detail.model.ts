/** Commentaire d'un article (miroir du `CommentDto` back). `author` = username. */
export interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

/**
 * Détail d'un article avec ses commentaires (miroir du `PostDetailDto` back).
 * Forme plate : `author` = username, `topic` = titre du sujet. `createdAt` en ISO string.
 */
export interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  topic: string;
  comments: Comment[];
}