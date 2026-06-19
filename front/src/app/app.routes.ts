import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'topics',
    loadComponent: () =>
      import('./pages/topics/topics.component').then((m) => m.TopicsComponent),
  },
  // Redirection provisoire vers la liste des sujets ; la page d'accueil
  { path: '', pathMatch: 'full', redirectTo: 'topics' },
];