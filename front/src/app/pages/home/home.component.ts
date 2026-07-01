import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../store/auth.store';

/**
 * Page d'accueil (écran d'entrée des maquettes) : logo MDD + accès Se connecter / S'inscrire.
 * Un utilisateur déjà authentifié est redirigé vers /feed (l'accueil est réservé aux visiteurs
 * non connectés) — même mécanique réactive que les pages login/register.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    // Utilisateur déjà connecté arrivant sur l'accueil → redirection vers le fil.
    effect(() => {
      if (this.store.isAuthenticated()) {
        this.router.navigate(['/feed']);
      }
    });
  }
}