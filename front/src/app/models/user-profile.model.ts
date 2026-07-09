import { Topic } from './topic.model';

/**
 * Profil de l'utilisateur connecté (miroir du `UserProfileDto` back) : ses infos et la
 * liste des sujets auxquels il est abonné (`TopicDto` avec `subscribed = true`).
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  subscriptions: Topic[];
}