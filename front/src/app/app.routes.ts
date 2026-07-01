import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Routes de l'application. Pages chargées en lazy (standalone) pour alléger le bundle
 * initial. Accueil public sur `/` ; `/feed` et `/topics` protégées par `authGuard`
 * (présence du token). Toute route inconnue retombe sur l'accueil.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/feed/feed.component').then((m) => m.FeedComponent),
  },
  {
    path: 'topics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/topics/topics.component').then((m) => m.TopicsComponent),
  },
  { path: '**', redirectTo: '' },
];