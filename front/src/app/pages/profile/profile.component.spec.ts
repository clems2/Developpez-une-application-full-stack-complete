import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ProfileComponent } from './profile.component';
import { UserProfile } from '../../models/user-profile.model';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  const profile: UserProfile = {
    id: 1,
    username: 'leo',
    email: 'leo@mail.fr',
    subscriptions: [{ id: 1, title: 'Java', description: 'a', subscribed: true }],
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit → loadProfile
    httpMock.expectOne('/api/me').flush(profile);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and prefill the form', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.username.value).toBe('leo');
    expect(component.form.controls.email.value).toBe('leo@mail.fr');
  });

  // Password optionnel : vide accepté, non conforme rejeté.
  it('should treat password as optional but enforce the rule when filled', () => {
    const pwd = component.form.controls.password;
    expect(pwd.valid).toBe(true); // vide = ok
    pwd.setValue('weak');
    expect(pwd.hasError('passwordPolicy')).toBe(true);
    pwd.setValue('Passw0rd!');
    expect(pwd.valid).toBe(true);
  });

  // Aucun changement : le submit n'envoie aucune requête (pas de déconnexion inutile).
  it('should not submit when nothing has changed', () => {
    expect(component.hasChanges()).toBe(false);
    component.submit();
    httpMock.expectNone('/api/me');
  });

  // Une modification réelle est détectée.
  it('should detect a real change', () => {
    component.form.controls.email.setValue('new@mail.fr');
    fixture.detectChanges();
    expect(component.hasChanges()).toBe(true);
  });

  // Champ modifié puis remis à sa valeur d'origine : aucun changement.
  it('should not consider a reverted field as a change', () => {
    component.form.controls.email.setValue('other@mail.fr');
    component.form.controls.email.setValue('leo@mail.fr');
    fixture.detectChanges();
    expect(component.hasChanges()).toBe(false);
  });

  // Update réussie : déconnexion + redirection /login.
  it('should logout and redirect to /login after a successful update', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.controls.username.setValue('leo2'); // changement réel, sinon la garde bloque
    fixture.detectChanges();

    component.submit();
    fixture.detectChanges(); // l'effect voit isUpdating = true → arme wasUpdating

    httpMock.expectOne('/api/me').flush({ ...profile, username: 'leo2' });
    await fixture.whenStable();
    fixture.detectChanges(); // l'effect voit la transition → loaded → navigate

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  // Désabonnement : retire le topic de la liste affichée.
  it('should remove a subscription on unsubscribe', async () => {
    component.unsubscribe(1);
    httpMock.expectOne('/api/topics/1/subscribe').flush(null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Vous n'êtes abonné à aucun thème.",
    );
  });
});