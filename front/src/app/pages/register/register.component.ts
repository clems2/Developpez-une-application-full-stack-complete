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
 * Robustesse du mot de passe — IDENTIQUE à `PasswordPolicy.REGEX` du back (8+ caractères,
 * dont un chiffre, une minuscule, une majuscule et un caractère spécial). Le front n'est
 * qu'un garde-fou UX (le back reste l'autorité), mais rejette avant l'appel réseau pour un
 * retour immédiat, avec le même critère → pas de divergence de règle front/back.
 */
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;

/**
 * Page d'inscription. Formulaire réactif (username + email + password) délégant la création
 * de compte au AuthStore. Sur succès, le back renvoie un token → auto-login : l'`effect()`
 * surveillant `isAuthenticated` redirige vers /feed (décision actée : on n'ignore pas le token).
 */
@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** View-model dérivé du store. */
  readonly vm = this.store.vm;

  /** Message de la règle de mot de passe, aligné sur `PasswordPolicy.MESSAGE` du back. */
  readonly passwordPolicyMessage =
    'Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, ' +
    'une majuscule, un chiffre et un caractère spécial.';

  /** Formulaire d'inscription typé, valeurs non nullables. */
  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
  });

  constructor() {
    // Auto-login après inscription : le token renvoyé par le back active la session.
    effect(() => {
      if (this.store.isAuthenticated()) {
        this.router.navigate(['/feed']);
      }
    });
  }

  /** Soumet la demande d'inscription au store si le formulaire est valide. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.register(this.form.getRawValue());
  }
}