/**
 * États possibles d'un chargement asynchrone, modélisés en union explicite.
 */
export type LoadingStatus = 'empty' | 'loading' | 'loaded' | 'error';