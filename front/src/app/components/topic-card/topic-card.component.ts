import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Topic } from '../../models/topic.model';

/**
 * Carte présentationnelle d'un sujet. Pilotée par un unique `input()` ;
 * aucune logique métier ni accès au store (cf. conventions, SRP/DIP).
 */
@Component({
  selector: 'app-topic-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="topic-card">
      <h3 class="topic-card__title">{{ topic().title }}</h3>
      <p class="topic-card__description">{{ topic().description }}</p>
    </article>
  `,
  styles: [
    `
      .topic-card {
        border: 1px solid var(--mat-sys-outline-variant, #ccc);
        border-radius: 8px;
        padding: 1rem;
      }
      .topic-card__title {
        margin: 0 0 0.5rem;
      }
      .topic-card__description {
        margin: 0;
      }
    `,
  ],
})
export class TopicCardComponent {
  /** Sujet à afficher (requis). */
  readonly topic = input.required<Topic>();
}