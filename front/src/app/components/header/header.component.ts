import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
 * (profil / déconnexion). Sur mobile, tout est replié derrière un menu burger qui ouvre un
 * panneau latéral (glissant depuis la droite, pleine hauteur, par-dessus le contenu, avec
 * un fond assombri), conforme à la maquette.
 *
 * Accessibilité du panneau : `role="dialog"` + `aria-modal`, fermeture à la touche Échap et
 * au clic sur le fond, défilement de la page bloqué à l'ouverture. Le piège de focus complet
 * (Tab bouclant dans le panneau) n'est pas implémenté — limite assumée de l'approche CSS pure
 * retenue plutôt que MatSidenav.
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
  private readonly document = inject(DOCUMENT);

  /** Liens de navigation à afficher (alimentés par le layout). */
  readonly links = input.required<NavLink[]>();

  /** Émis au clic sur « Mon profil » ; le layout réalise la navigation. */
  readonly profile = output<void>();

  /** Émis au clic sur « Se déconnecter » ; le layout réalise le logout + redirection. */
  readonly logout = output<void>();

  /** État d'ouverture du panneau mobile (burger). Local à la vue → simple signal. */
  readonly menuOpen = signal(false);

  constructor() {
    // Bloque le défilement de la page tant que le panneau est ouvert : le contenu de fond
    // ne doit pas défiler sous le panneau. Restauré à la fermeture.
    effect(() => {
      this.document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  /** Ferme le panneau sur pression de la touche Échap (accessibilité). */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    }
  }

  /** Ouvre/ferme le panneau mobile. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Ferme le panneau (après navigation, clic sur le fond, ou action). */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Relaie la demande d'accès au profil au parent et referme le panneau. */
  onProfile(): void {
    this.closeMenu();
    this.profile.emit();
  }

  /** Relaie la demande de déconnexion au parent et referme le panneau. */
  onLogout(): void {
    this.closeMenu();
    this.logout.emit();
  }
}