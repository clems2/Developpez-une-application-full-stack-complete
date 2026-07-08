import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ArticleDetailStore } from '../../store/article-detail.store';

/**
 * Page (container) du détail d'un article. L'`id` provient de la route via `input()`
 * (withComponentInputBinding) et est converti en nombre. Un `effect()` recharge le détail
 * quand l'id change — y compris lors d'une navigation d'un article à un autre sans quitter
 * la page. Affiche l'article et ses commentaires en lecture.
 */
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent {
  private readonly store = inject(ArticleDetailStore);

  /** Id de l'article, lié au paramètre de route `:id` et converti en nombre. */
  readonly id = input.required({ transform: numberAttribute });

  /** View-model du détail, dérivé du store. */
  readonly vm = this.store.vm;

  constructor() {
    // Recharge à chaque changement d'id (suit /articles/7 → /articles/8 sans re-création).
    effect(() => {
      this.store.loadDetail(this.id());
    });
  }
}