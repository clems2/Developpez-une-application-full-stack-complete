import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ArticleDetailStore } from '../../store/article-detail.store';

/**
 * Page (container) du détail d'un article. L'`id` provient de la route via `input()`
 * (withComponentInputBinding), converti en nombre ; un `effect()` recharge au changement d'id.
 * Affiche l'article, la liste des commentaires, et un formulaire d'ajout de commentaire.
 */
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent {
  private readonly store = inject(ArticleDetailStore);
  private readonly fb = inject(FormBuilder);

  /** Id de l'article, lié au paramètre de route `:id` et converti en nombre. */
  readonly id = input.required({ transform: numberAttribute });

  /** View-model du détail, dérivé du store. */
  readonly vm = this.store.vm;

  /** Formulaire d'ajout de commentaire (contenu requis, ≤ 1000 — miroir back). */
  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  /**
   * Directive `[formGroup]` du formulaire de commentaire.
   *
   * Nécessaire pour `resetForm()` : Angular Material affiche l'état d'erreur d'un champ dès
   * que le contrôle est invalide ET que la directive est passée par `submitted` — un drapeau
   * que ni `reset()` ni `markAsUntouched()` sur le FormGroup ne remettent à zéro. Sans cet
   * accès, le champ restait rouge après un ajout réussi.
   *
   * Optionnelle car le formulaire n'est rendu que lorsque l'article est chargé (`@switch`).
   */
  private readonly commentFormDirective = viewChild(FormGroupDirective);

  /** Mémorise qu'un envoi était en cours, pour détecter la transition vers le succès. */
  private wasSubmitting = false;

  constructor() {
    // Recharge à chaque changement d'id (suit /articles/7 → /articles/8 sans re-création).
    effect(() => {
      this.store.loadDetail(this.id());
    });

    // Réinitialise le formulaire UNIQUEMENT après un ajout réussi (transition envoi → succès).
    // `resetForm()` vide la valeur, repasse pristine/untouched ET annule l'état `submitted` :
    // c'est le seul appel qui éteint complètement l'état d'erreur du mat-form-field.
    effect(() => {
      const submitting = this.vm().isSubmittingComment;
      if (this.wasSubmitting && !submitting && this.store.commentStatus() === 'loaded') {
        this.commentFormDirective()?.resetForm();
      }
      this.wasSubmitting = submitting;
    });
  }

  /** Soumet un nouveau commentaire si le formulaire est valide. Ne vide PAS le champ ici :
   *  le reset a lieu sur succès (effect), pour préserver le texte en cas d'échec. */
  submitComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.store.addComment({
      postId: this.id(),
      content: this.commentForm.getRawValue().content,
    });
  }
}