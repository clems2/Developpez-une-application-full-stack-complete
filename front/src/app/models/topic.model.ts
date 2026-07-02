/**
 * Topic exposé par l'API (`GET /api/topics`).
 */
export interface Topic {
  id: number;
  title: string;
  description: string;
  subscribed: boolean;
}