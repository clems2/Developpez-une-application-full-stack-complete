import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ProfileStore } from '../../store/profile.store';
import { AuthStore } from '../../store/auth.store';

/** Règle de mot de passe (miroir back). Optionnelle : vide = inchangé, sinon doit être conforme. */
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;

/** Validator : mot de passe optionnel — vide = valide (inchangé), sinon doit respecter la règle. */
function optionalPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null; // champ vide = inchangé, accepté
  }
  return PASSWORD_PATTERN.test(value) ? null : { passwordPolicy: true };
}

/**
 * Page (container) du profil. Deux sections : édition des infos (username/email/password
 * optionnel) et liste des abonnements avec désabonnement.
 *
 * Aucune requête n'est envoyée si les informations n'ont pas réellement changé (garde
 * `hasChanges`), ce qui évite une déconnexion inutile. Après une mise à jour effective et
 * réussie, l'utilisateur est déconnecté et renvoyé au login : le username étant le sujet du
 * JWT, toute modification invalide la session (reconnexion uniforme, décision actée).
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly store = inject(ProfileStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** View-model du profil, dérivé du store. */
  readonly vm = this.store.vm;

  /** Message de la règle de mot de passe (aligné back). */
  readonly passwordPolicyMessage =
    'Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, ' +
    'une majuscule, un chiffre et un caractère spécial.';

  /** Formulaire d'édition. `password` optionnel (vide = inchangé). */
  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', optionalPasswordValidator],
  });

  /** Mémorise qu'une mise à jour était en cours, pour détecter la transition vers le succès. */
  private wasUpdating = false;

  constructor() {
    // Pré-remplit le formulaire dès que le profil est chargé.
    effect(() => {
      const profile = this.store.profile();
      if (profile) {
        this.form.patchValue({ username: profile.username, email: profile.email });
      }
    });

    // Déconnexion après une mise à jour réussie (transition update → succès).
    effect(() => {
      const updating = this.vm().isUpdating;
      if (this.wasUpdating && !updating && this.store.updateStatus() === 'loaded') {
        this.authStore.logout();
        this.router.navigate(['/login']);
      }
      this.wasUpdating = updating;
    });
  }

  ngOnInit(): void {
    this.store.loadProfile();
  }

  /**
   * Vrai si le formulaire diffère réellement du profil chargé : username ou email modifié,
   * ou mot de passe renseigné. Un champ modifié puis remis à sa valeur d'origine ne compte
   * pas comme un changement (contrairement à `form.dirty`). Sert de garde à l'envoi et à
   * l'activation du bouton.
   */
  hasChanges(): boolean {
    const profile = this.store.profile();
    if (!profile) {
      return false;
    }
    const { username, email, password } = this.form.getRawValue();
    return (
      username !== profile.username ||
      email !== profile.email ||
      password.length > 0
    );
  }

  /** Soumet la mise à jour si le formulaire est valide ET si les informations ont changé. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.hasChanges()) {
      return; // aucune modification : pas de requête, pas de déconnexion inutile
    }
    this.store.updateProfile(this.form.getRawValue());
  }

  /** Désabonne l'utilisateur du sujet donné. */
  unsubscribe(topicId: number): void {
    this.store.unsubscribe(topicId);
  }
}