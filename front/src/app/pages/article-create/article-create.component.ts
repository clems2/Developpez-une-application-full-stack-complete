import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ArticlesStore } from '../../store/articles.store';
import { TopicsStore } from '../../store/topics.store';

/**
 * Page (container) de création d'un article. Formulaire réactif (sujet + titre + contenu).
 * Le select ne propose QUE les sujets auxquels l'utilisateur est abonné (réutilise le flag
 * `subscribed` de TopicsStore — règle tuteur, filtre UX). La garde réelle reste back (403).
 * Sur succès, redirige vers /feed (l'article publié y apparaît).
 */
@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-create.component.html',
  styleUrl: './article-create.component.scss',
})
export class ArticleCreateComponent implements OnInit {
  private readonly articlesStore = inject(ArticlesStore);
  private readonly topicsStore = inject(TopicsStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** View-model de la création (statut, erreur). */
  readonly vm = this.articlesStore.vm;

  /** Sujets abonnés uniquement — alimente le select (règle tuteur, filtre front). */
  readonly subscribedTopics = computed(() =>
    this.topicsStore.topics().filter((t) => t.subscribed),
  );

  /** Formulaire de création typé, valeurs non nullables. */
  readonly form = this.fb.nonNullable.group({
    topicId: [null as number | null, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(100)]],
    content: ['', Validators.required],
  });

  constructor() {
    // Navigation post-succès : la page réagit, le store ne navigue pas (SRP).
    effect(() => {
      if (this.articlesStore.isCreated()) {
        this.router.navigate(['/feed']);
      }
    });
  }

  ngOnInit(): void {
    this.articlesStore.reset();
    // Charge les sujets si le store est vide (ex. accès direct à /articles/new).
    if (this.topicsStore.topics().length === 0) {
      this.topicsStore.loadTopics();
    }
  }

  /** Soumet la création si le formulaire est valide. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { topicId, title, content } = this.form.getRawValue();
    this.articlesStore.create({ topicId: topicId as number, title, content });
  }
}