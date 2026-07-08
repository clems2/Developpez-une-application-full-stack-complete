import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ArticleDetailStore } from '../../store/article-detail.store';

/**
 * Page (container) du détail d'un article. Lit l'id depuis la route, déclenche le chargement,
 * affiche l'article (thème/titre/auteur/date/contenu) et la liste de ses commentaires en
 * lecture. L'ajout de commentaire fera l'objet d'un slice dédié.
 */
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent implements OnInit {
  private readonly store = inject(ArticleDetailStore);
  private readonly route = inject(ActivatedRoute);

  /** View-model du détail, dérivé du store. */
  readonly vm = this.store.vm;

  /** Charge le détail à partir de l'id de la route. */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.store.loadDetail(id);
  }
}