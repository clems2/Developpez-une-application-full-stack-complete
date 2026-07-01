import { expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home.component';
import { TokenStorageService } from '../../core/service/token-storage.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Visiteur non connecté : les deux accès (login/register) sont présents.
  it('should expose links to /login and /register when not authenticated', () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a[routerLink]'));
    const targets = links.map(
      (l) => l.attributes['ng-reflect-router-link'] ?? l.attributes['routerLink'],
    );
    expect(targets).toContain('/login');
    expect(targets).toContain('/register');
  });

  // Visiteur non connecté : pas de redirection.
  it('should NOT redirect when no token', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // Utilisateur déjà connecté : redirection vers /feed.
  it('should redirect to /feed when a token is present', () => {
    // Token présent AVANT la création du composant → le store s'hydrate à l'init (onInit).
    TestBed.inject(TokenStorageService).setToken('jwt');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/feed']);
  });
});