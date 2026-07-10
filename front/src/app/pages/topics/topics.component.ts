import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { TopicCardComponent } from '../../components/topic-card/topic-card.component';
import { TopicsStore } from '../../store/topics.store';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
/**
 * Page (container) listant les thèmes. Lit le view-model du store en signal
 * et délègue l'affichage de chaque thème à `app-topic-card`.
 */
@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [TopicCardComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm(); as v) {
      @switch (v.status) {
        @case ('loading') {
          <app-spinner [label]="'Chargement des thèmes…'" />
        }
        @case ('error') {
          <p>Une erreur est survenue lors du chargement des thèmes.</p>
        }
        @default {
          @if (v.isEmpty) {
            <p>Aucun thème disponible.</p>
          } @else {
            <section class="topics-list">
              @for (topic of v.topics; track topic.id) {
                <app-topic-card [topic]="topic" (subscribe)="onSubscribe($event)" />
              }
            </section>
          }
        }
      }
    }
  `,
  styles: [
    `
      /* Deux colonnes fixes (maquette desktop). L'ancienne valeur auto-fill avec
         minmax(280px, 1fr) en produisait trois sur une largeur de 1100px. */
      .topics-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      /* Mode compact : même seuil que le header, pour ne pas laisser de bande où le
         menu serait en burger alors que la grille resterait en deux colonnes. */
      @media (max-width: 768px) {
        .topics-list {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TopicsComponent implements OnInit {
  private readonly store = inject(TopicsStore);

  /** View-model de la page, dérivé du store. */
  readonly vm = this.store.vm;

  /** Déclenche le chargement des thèmes à l'initialisation. */
  ngOnInit(): void {
    this.store.loadTopics();
  }

  /** Relaie l'intention d'abonnement d'une carte au store. */
  onSubscribe(topicId: number): void {
    this.store.subscribe(topicId);
  }
}