import { LoadingStatus } from './loading-status';

/**
 * État du domaine articles pour la création : statut de l'opération et message d'erreur
 * métier destiné au formulaire (mappé depuis le code HTTP du rejet back).
 */
export interface ArticlesState {
  status: LoadingStatus;
  error: string | null;
}

/** État initial : aucune création en cours. */
export const initialArticlesState: ArticlesState = {
  status: 'empty',
  error: null,
};

/** View-model consommé par la page de création. */
export interface ArticleCreateViewModel {
  status: LoadingStatus;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}