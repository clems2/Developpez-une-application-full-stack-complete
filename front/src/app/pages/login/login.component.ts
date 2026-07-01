import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthStore } from '../../store/auth.store';

/**
 * Page de connexion. Formulaire réactif (identifiant + mot de passe) délégant
 * l'authentification au AuthStore. Lit le view-model en signal (chargement/erreur) et
 * redirige vers /feed dès que la session est active, via un `effect()` surveillant
 * `isAuthenticated` — la navigation ne vit pas dans le store (décision actée).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** View-model dérivé du store (statut, drapeaux d'affichage, message d'erreur). */
  readonly vm = this.store.vm;

  /** Formulaire de connexion typé, valeurs non nullables. */
  readonly form = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    // Redirection réactive : dès qu'une session est active (login réussi, ou utilisateur
    // déjà authentifié arrivant sur /login), on quitte la page vers le fil.
    effect(() => {
      if (this.store.isAuthenticated()) {
        this.router.navigate(['/feed']);
      }
    });
  }

  /** Soumet les identifiants au store si le formulaire est valide. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.login(this.form.getRawValue());
  }
}