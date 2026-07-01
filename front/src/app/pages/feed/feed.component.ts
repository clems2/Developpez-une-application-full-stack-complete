import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/**
 * Placeholder du fil d'actualité (slice feed à venir). Affiche l'état vide attendu tant
 * qu'aucun abonnement n'alimente le fil ; c'est l'atterrissage post-login/inscription.
 * Sera remplacé par le vrai container feed (lecture du FeedStore) lors du slice dédié.
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent {}