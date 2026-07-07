import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ArticleCardComponent } from '../../components/article-card/article-card.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { FeedStore } from '../../store/feed.store';
import { FeedOrder } from '../../models/post.model';
import { RouterLink } from '@angular/router';

/**
 * Page (container) du fil d'actualité. Lit le view-model du FeedStore en signal, déclenche
 * le chargement à l'init, et expose le contrôle de tri par date. L'affichage de chaque
 * article est délégué à `app-article-card`.
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [ArticleCardComponent, SpinnerComponent, MatButtonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm(); as v) {
      <div class="feed">
        <header class="feed__head">
          <h1 class="feed__title">Votre fil d'actualité</h1>
          <div class="feed__actions">
            <a mat-flat-button color="primary" routerLink="/articles/new">Créer un article</a>
            <button mat-stroked-button (click)="toggleOrder(v.order)">
              <mat-icon>{{ v.order === 'desc' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
              Trier par date
            </button>
          </div>
        </header>

        @switch (v.status) {
          @case ('loading') {
            <app-spinner label="Chargement du fil…" />
          }
          @case ('error') {
            <p class="feed__error">Une erreur est survenue lors du chargement du fil.</p>
          }
          @default {
            @if (v.isEmpty) {
              <p class="feed__empty">Aucun feed car vous n'êtes abonné à aucun thème.</p>
            } @else {
              <section class="feed__list">
                @for (post of v.posts; track post.id) {
                  <app-article-card [post]="post" />
                }
              </section>
            }
          }
        }
      </div>
    }
  `,
  styles: [
    `
      .feed {
        max-width: 800px;
        margin: 0 auto;
      }
      .feed__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .feed__title {
        margin: 0;
      }
      .feed__list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .feed__actions {
        display: flex;
        gap: 0.75rem;
      }
      @media (max-width: 480px) {
        .feed__head {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class FeedComponent implements OnInit {
  private readonly store = inject(FeedStore);

  /** View-model du fil, dérivé du store. */
  readonly vm = this.store.vm;

  /** Charge le fil à l'initialisation. */
  ngOnInit(): void {
    this.store.loadFeed();
  }

  /** Bascule le sens de tri (desc ↔ asc) et recharge le fil. */
  toggleOrder(current: FeedOrder): void {
    this.store.setOrder(current === 'desc' ? 'asc' : 'desc');
  }
}