import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

/**
 * Page d'accueil (écran d'entrée des maquettes) : logo MDD + accès Se connecter / S'inscrire.
 * Composant purement présentationnel, sans dépendance au store ni logique de routing : la
 * redirection d'un utilisateur déjà connecté vers /feed est portée par `guestGuard` (couche
 * routing), pas par le composant.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}