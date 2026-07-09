import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LayoutComponent } from './layout.component';
import { TokenStorageService } from '../core/service/token-storage.service';

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let component: LayoutComponent;
  let router: Router;
  let tokenStorage: TokenStorageService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    tokenStorage = TestBed.inject(TokenStorageService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Le header est rendu dans le layout.
  it('should render the header', () => {
    expect(fixture.debugElement.query(By.css('app-header'))).not.toBeNull();
  });

  // Les liens de navigation sont conformes aux maquettes.
  it('should expose Articles and Thèmes links', () => {
    expect(component.navLinks).toEqual([
      { label: 'Articles', path: '/feed' },
      { label: 'Thèmes', path: '/topics' },
    ]);
  });

  // Accès profil : navigue vers /me.
  it('should navigate to /me on profile', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onProfile();

    expect(navigateSpy).toHaveBeenCalledWith(['/me']);
  });

  // Déconnexion : purge le token (via store.logout) et redirige vers l'accueil.
  it('should clear the token and navigate to / on logout', () => {
    tokenStorage.setToken('jwt');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onLogout();

    expect(tokenStorage.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});