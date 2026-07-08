import { PostDetail } from '../models/post-detail.model';
import { LoadingStatus } from './loading-status';

/**
 * État du détail d'un article : l'article chargé (ou null), le statut de chargement, et
 * l'état d'envoi d'un commentaire (distinct, pour ne pas masquer l'article pendant l'envoi).
 */
export interface ArticleDetailState {
  post: PostDetail | null;
  status: LoadingStatus;
  commentStatus: LoadingStatus;
  commentError: string | null;
}

/** État initial : aucun article chargé. */
export const initialArticleDetailState: ArticleDetailState = {
  post: null,
  status: 'empty',
  commentStatus: 'empty',
  commentError: null,
};

/** View-model consommé par la page détail. */
export interface ArticleDetailViewModel {
  post: PostDetail | null;
  status: LoadingStatus;
  isLoading: boolean;
  isError: boolean;
  isLoaded: boolean;
  isSubmittingComment: boolean;
  commentError: string | null;
}