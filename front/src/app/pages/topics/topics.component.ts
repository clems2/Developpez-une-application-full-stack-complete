import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { TopicCardComponent } from '../../components/topic-card/topic-card.component';
import { TopicsStore } from '../../store/topics.store';

/**
 * Page (container) listant les sujets. Lit le view-model du store en signal
 * et délègue l'affichage de chaque sujet à `app-topic-card`.
 */
@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [TopicCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm(); as v) {
      @switch (v.status) {
        @case ('loading') {
          <p>Chargement des sujets…</p>
        }
        @case ('error') {
          <p>Une erreur est survenue lors du chargement des sujets.</p>
        }
        @default {
          @if (v.isEmpty) {
            <p>Aucun sujet disponible.</p>
          } @else {
            <section class="topics-list">
              @for (topic of v.topics; track topic.id) {
                <app-topic-card [topic]="topic" />
              }
            </section>
          }
        }
      }
    }
  `,
  styles: [
    `
      .topics-list {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    `,
  ],
})
export class TopicsComponent implements OnInit {
  private readonly store = inject(TopicsStore);

  /** View-model de la page, dérivé du store. */
  readonly vm = this.store.vm;

  /** Déclenche le chargement des sujets à l'initialisation. */
  ngOnInit(): void {
    this.store.loadTopics();
  }
}