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

/** Un lien de navigation du header. `label` affiché, `path` = route cible. */
export interface NavLink {
  label: string;
  path: string;
}

/**
 * En-tête de navigation des écrans connectés. Composant présentationnel **générique** :
 * il ne connaît aucune route en dur, il reçoit ses liens via `links` (input) et émet
 * `logout` (output) — la logique de déconnexion vit dans le layout, pas ici (SRP/DIP).
 * Responsive : liens en ligne sur desktop, repliés derrière un menu burger sur mobile.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  /** Liens de navigation à afficher (alimentés progressivement par le layout). */
  readonly links = input.required<NavLink[]>();

  /** Émis au clic sur « Se déconnecter » ; le layout réalise le logout + redirection. */
  readonly logout = output<void>();

  /** État d'ouverture du menu mobile (burger). Local à la vue → simple signal. */
  readonly menuOpen = signal(false);

  /** Ouvre/ferme le menu mobile. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Ferme le menu (après navigation ou déconnexion sur mobile). */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Relaie la demande de déconnexion au parent et referme le menu mobile. */
  onLogout(): void {
    this.closeMenu();
    this.logout.emit();
  }
}