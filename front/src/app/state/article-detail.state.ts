import { PostDetail } from '../models/post-detail.model';
import { LoadingStatus } from './loading-status';

/** État du détail d'un article : l'article chargé (ou null) et le statut. */
export interface ArticleDetailState {
  post: PostDetail | null;
  status: LoadingStatus;
}

/** État initial : aucun article chargé. */
export const initialArticleDetailState: ArticleDetailState = {
  post: null,
  status: 'empty',
};

/** View-model consommé par la page détail. */
export interface ArticleDetailViewModel {
  post: PostDetail | null;
  status: LoadingStatus;
  isLoading: boolean;
  isError: boolean;
  isLoaded: boolean;
}