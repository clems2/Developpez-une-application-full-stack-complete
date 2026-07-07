import { Post, FeedOrder } from '../models/post.model';
import { LoadingStatus } from './loading-status';

/**
 * État du fil d'actualité : articles chargés, statut de chargement et sens de tri courant.
 * Le tri est un état local au fil (piloté par l'UI), pas une donnée serveur.
 */
export interface FeedState {
  posts: Post[];
  status: LoadingStatus;
  order: FeedOrder;
}

/** État initial : aucun article, statut vide, tri par défaut récent → ancien. */
export const initialFeedState: FeedState = {
  posts: [],
  status: 'empty',
  order: 'desc',
};

/**
 * View-model consommé par la page du fil : statut brut + drapeaux dérivés + tri courant,
 * pour piloter l'affichage sans logique dans le template.
 */
export interface FeedViewModel {
  posts: Post[];
  status: LoadingStatus;
  order: FeedOrder;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}