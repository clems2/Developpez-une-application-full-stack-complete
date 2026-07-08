import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';

/** Longueur maximale de l'extrait affiché dans le fil (caractères). */
const EXCERPT_MAX = 150;

/**
 * Carte présentationnelle d'un article dans le fil. Pilotée par un `input()` ; aucune logique
 * métier ni accès au store (SRP/DIP). Cliquable : mène au détail `/articles/:id` (lien
 * déclaratif, accessible). Affiche titre, méta, thème et un extrait tronqué du contenu.
 */
@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="article-card" [routerLink]="['/articles', post().id]">
      <header class="article-card__head">
        <h3 class="article-card__title">{{ post().title }}</h3>
        <span class="article-card__topic">{{ post().topic }}</span>
      </header>
      <p class="article-card__meta">
        {{ post().createdAt | date: 'dd/MM/yyyy' }} · {{ post().author }}
      </p>
      <p class="article-card__excerpt">{{ excerpt() }}</p>
    </article>
  `,
  styles: [
    `
      .article-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border: 1px solid var(--mat-sys-outline-variant, #ccc);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: box-shadow 0.15s ease;
      }
      .article-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .article-card__head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 1rem;
      }
      .article-card__title {
        margin: 0;
      }
      .article-card__topic {
        font-size: 0.85rem;
        color: #6c5ce7;
        white-space: nowrap;
      }
      .article-card__meta {
        margin: 0;
        font-size: 0.85rem;
        color: rgba(0, 0, 0, 0.6);
      }
      .article-card__excerpt {
        margin: 0;
      }
    `,
  ],
})
export class ArticleCardComponent {
  /** Article à afficher (requis). */
  readonly post = input.required<Post>();

  /** Extrait tronqué du contenu (ellipse au-delà de la limite). */
  readonly excerpt = computed(() => {
    const content = this.post().content;
    return content.length > EXCERPT_MAX
      ? `${content.slice(0, EXCERPT_MAX).trimEnd()}…`
      : content;
  });
}