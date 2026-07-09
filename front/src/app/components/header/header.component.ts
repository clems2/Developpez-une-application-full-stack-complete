import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

/** Un lien de navigation du header. `label` affiché, `path` = route cible. */
export interface NavLink {
  label: string;
  path: string;
}

/**
 * En-tête de navigation des écrans connectés. Composant présentationnel **générique** :
 * il ne connaît aucune route en dur, il reçoit ses liens via `links` (input) et émet ses
 * intentions (`profile`, `logout`) — la navigation et la déconnexion vivent dans le layout
 * (SRP/DIP).
 *
 * Responsive : sur desktop, liens en ligne + icône utilisateur à droite ouvrant un menu
 * (profil / déconnexion). Sur mobile, tout est replié derrière un menu burger, y compris
 * l'accès au profil et la déconnexion.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  /** Liens de navigation à afficher (alimentés par le layout). */
  readonly links = input.required<NavLink[]>();

  /** Émis au clic sur « Mon profil » ; le layout réalise la navigation. */
  readonly profile = output<void>();

  /** Émis au clic sur « Se déconnecter » ; le layout réalise le logout + redirection. */
  readonly logout = output<void>();

  /** État d'ouverture du menu mobile (burger). Local à la vue → simple signal. */
  readonly menuOpen = signal(false);

  /** Ouvre/ferme le menu mobile. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Ferme le menu (après navigation ou action sur mobile). */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Relaie la demande d'accès au profil au parent et referme le menu mobile. */
  onProfile(): void {
    this.closeMenu();
    this.profile.emit();
  }

  /** Relaie la demande de déconnexion au parent et referme le menu mobile. */
  onLogout(): void {
    this.closeMenu();
    this.logout.emit();
  }
}