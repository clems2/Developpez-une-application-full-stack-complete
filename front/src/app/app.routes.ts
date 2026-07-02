import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

/**
 * Routes de l'application.
 * - Routes publiques (`''`, `login`, `register`) : réservées aux visiteurs par `guestGuard`.
 * - Routes connectées : enfants d'un `LayoutComponent` (header + contenu). `authGuard` est
 *   porté **une seule fois** par la route parente → protection mutualisée, plus de répétition
 *   sur chaque enfant.
 * L'ordre importe : les chemins publics spécifiques (`login`, `register`) et l'accueil `''`
 * en `pathMatch: 'full'` sont déclarés avant la route parente connectée pour éviter tout
 * conflit de matching sur le chemin vide.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'feed',
        loadComponent: () =>
          import('./pages/feed/feed.component').then((m) => m.FeedComponent),
      },
      {
        path: 'topics',
        loadComponent: () =>
          import('./pages/topics/topics.component').then((m) => m.TopicsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];