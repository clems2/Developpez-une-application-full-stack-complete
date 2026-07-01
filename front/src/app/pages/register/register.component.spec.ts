import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Formulaire vide : invalide.
  it('should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  // Politique de mot de passe : faible rejeté, conforme accepté (miroir back).
  it('should reject a weak password and accept a compliant one', () => {
    const pwd = component.form.controls.password;
    pwd.setValue('weak');
    expect(pwd.hasError('pattern')).toBe(true);
    pwd.setValue('Passw0rd!');
    expect(pwd.valid).toBe(true);
  });

  // Email mal formé rejeté.
  it('should reject an invalid email', () => {
    const email = component.form.controls.email;
    email.setValue('not-an-email');
    expect(email.hasError('email')).toBe(true);
  });

  // Inscription OK : auto-login → /feed.
  it('should navigate to /feed on successful register', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ username: 'alice', email: 'alice@mail.fr', password: 'Passw0rd!' });
    component.submit();

    httpMock.expectOne('/api/auth/register').flush({ token: 'jwt' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/feed']);
  });

  // Échec (409 conflit) : message affiché, pas de navigation.
  it('should display an error and not navigate on failure', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ username: 'alice', email: 'alice@mail.fr', password: 'Passw0rd!' });
    component.submit();

    httpMock
      .expectOne('/api/auth/register')
      .flush('Conflict', { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('.auth-error'))).not.toBeNull();
  });
});