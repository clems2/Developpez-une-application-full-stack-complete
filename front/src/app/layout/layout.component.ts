import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent, NavLink } from '../components/header/header.component';
import { AuthStore } from '../store/auth.store';

/**
 * Layout des écrans connectés : header de navigation + zone de contenu (`router-outlet`
 * enfant). C'est ici que vivent la navigation vers le profil et la logique de déconnexion
 * (le header, générique, se contente de les émettre).
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header [links]="navLinks" (profile)="onProfile()" (logout)="onLogout()" />
    <main class="layout__content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .layout__content {
        max-width: 1100px;
        margin: 0 auto;
        padding: 1rem;
      }
    `,
  ],
})
export class LayoutComponent {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  /** Liens de navigation, conformes aux maquettes (Articles = fil d'actualité). */
  readonly navLinks: NavLink[] = [
    { label: 'Articles', path: '/feed' },
    { label: 'Thèmes', path: '/topics' },
  ];

  /** Navigue vers le profil de l'utilisateur. */
  onProfile(): void {
    this.router.navigate(['/me']);
  }

  /** Déconnecte l'utilisateur (purge token + état) puis renvoie à l'accueil. */
  onLogout(): void {
    this.store.logout();
    this.router.navigate(['/']);
  }
}