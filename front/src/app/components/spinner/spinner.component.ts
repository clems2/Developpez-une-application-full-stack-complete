import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Indicateur de chargement réutilisable (Material). Composant présentationnel pur : il
 * affiche l'animation et un libellé optionnel, sans savoir *quand* s'afficher — c'est la
 * page qui le rend conditionnellement (`@if (v.isLoading)`). Diamètre paramétrable via `size`.
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  /** Texte affiché sous l'animation (ex. « Chargement des sujets… »). Optionnel. */
  readonly label = input<string>('');

  /** Diamètre du spinner en pixels. */
  readonly size = input<number>(48);
}