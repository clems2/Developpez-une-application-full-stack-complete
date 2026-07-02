import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  let component: SpinnerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Rend le spinner Material.
  it('should render the Material progress spinner', () => {
    expect(fixture.debugElement.query(By.css('mat-progress-spinner'))).not.toBeNull();
  });

  // Sans label : pas de texte affiché.
  it('should not render a label by default', () => {
    expect(fixture.debugElement.query(By.css('.spinner__label'))).toBeNull();
  });

  // Avec label : texte affiché + exposé en aria-label.
  it('should render the provided label', () => {
    fixture.componentRef.setInput('label', 'Chargement des sujets…');
    fixture.detectChanges();

    const labelEl = fixture.debugElement.query(By.css('.spinner__label'));
    expect(labelEl).not.toBeNull();
    expect((labelEl.nativeElement as HTMLElement).textContent).toContain('Chargement des sujets…');

    const container = fixture.debugElement.query(By.css('.spinner')).nativeElement as HTMLElement;
    expect(container.getAttribute('aria-label')).toBe('Chargement des sujets…');
  });
});