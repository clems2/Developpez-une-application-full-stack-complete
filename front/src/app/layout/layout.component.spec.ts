import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LayoutComponent } from './layout.component';
import { AuthStore } from '../store/auth.store';
import { TokenStorageService } from '../core/service/token-storage.service';

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let component: LayoutComponent;
  let router: Router;
  let tokenStorage: TokenStorageService;

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
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Le header est rendu dans le layout.
  it('should render the header', () => {
    expect(fixture.debugElement.query(By.css('app-header'))).not.toBeNull();
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