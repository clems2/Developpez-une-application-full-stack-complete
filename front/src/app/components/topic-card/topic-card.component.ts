import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Topic } from '../../models/topic.model';

/**
 * Carte présentationnelle d'un sujet. Pilotée par un `input()` ; aucune logique métier ni
 * accès au store (SRP/DIP). L'intention d'abonnement est **émise** (`subscribe`) et traitée
 * par la page container. Conforme aux specs : une fois abonné, le bouton devient inactif et
 * affiche « Déjà abonné » (le désabonnement se fait depuis le profil).
 */
@Component({
  selector: 'app-topic-card',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="topic-card">
      <h3 class="topic-card__title">{{ topic().title }}</h3>
      <p class="topic-card__description">{{ topic().description }}</p>

      @if (topic().subscribed) {
        <button mat-stroked-button disabled>Déjà abonné</button>
      } @else {
        <button mat-flat-button color="primary" (click)="subscribe.emit(topic().id)">
          S'abonner
        </button>
      }
    </article>
  `,
  styles: [
    `
      .topic-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border: 1px solid var(--mat-sys-outline-variant, #ccc);
        border-radius: 8px;
        padding: 1rem;
      }
      .topic-card__title {
        margin: 0;
      }
      .topic-card__description {
        margin: 0;
        flex: 1;
      }
      .topic-card button {
        align-self: flex-start;
      }
    `,
  ],
})
export class TopicCardComponent {
  /** Sujet à afficher (requis). */
  readonly topic = input.required<Topic>();

  /** Émis au clic sur « S'abonner » ; porte l'id du sujet. La page appelle le store. */
  readonly subscribe = output<number>();
}