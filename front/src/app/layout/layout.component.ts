import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent, NavLink } from '../components/header/header.component';
import { AuthStore } from '../store/auth.store';

/**
 * Layout des écrans connectés : header de navigation + zone de contenu (`router-outlet`
 * enfant). C'est ici que vit la logique de déconnexion (le header, générique, se contente
 * de l'émettre). Les liens sont alimentés **progressivement** : seuls les écrans existants
 * sont câblés ; Articles/profil seront ajoutés à leurs slices respectifs.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header [links]="navLinks" (logout)="onLogout()" />
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

  /** Liens de navigation actuels (progressif : complété au fil des slices). */
  readonly navLinks: NavLink[] = [{ label: 'Thèmes', path: '/topics' }];

  /** Déconnecte l'utilisateur (purge token + état) puis renvoie à l'accueil (décision I=a). */
  onLogout(): void {
    this.store.logout();
    this.router.navigate(['/']);
  }
}