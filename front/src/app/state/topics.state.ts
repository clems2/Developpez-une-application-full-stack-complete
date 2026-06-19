import { Topic } from '../models/topic.model';
import { LoadingStatus } from './loading-status';

/**
 * État du stockage des sujets : la liste chargée et le statut de chargement.
 */
export interface TopicsState {
  topics: Topic[];
  status: LoadingStatus;
}

/** État initial : aucune donnée, statut vide. */
export const initialTopicsState: TopicsState = {
  topics: [],
  status: 'empty',
};

/**
 * View-model consommé par la page des sujets : statut brut + drapeaux dérivés
 * pour piloter l'affichage sans logique dans le template.
 */
export interface TopicsViewModel {
  topics: Topic[];
  status: LoadingStatus;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}