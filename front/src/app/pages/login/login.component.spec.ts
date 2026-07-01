import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Formulaire vide : invalide (les deux champs requis).
  it('should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  // Submit invalide : aucun appel réseau.
  it('should not call the API when the form is invalid', () => {
    component.submit();
    httpMock.expectNone('/api/auth/login');
  });

  // Pendant le chargement : bouton désactivé.
  it('should disable the submit button while loading', () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ identifier: 'a@b.fr', password: 'whatever' });
    component.submit();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);

    httpMock.expectOne('/api/auth/login').flush({ token: 'jwt' });
  });

  // Login OK : redirection vers /feed.
  it('should navigate to /feed on successful login', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ identifier: 'alice@mail.fr', password: 'whatever' });
    component.submit();

    httpMock.expectOne('/api/auth/login').flush({ token: 'jwt' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/feed']);
  });

  // Login KO (401) : message affiché, pas de navigation.
  it('should display an error and not navigate on 401', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ identifier: 'alice@mail.fr', password: 'wrong' });
    component.submit();

    httpMock
      .expectOne('/api/auth/login')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('.auth-error'))).not.toBeNull();
  });
});