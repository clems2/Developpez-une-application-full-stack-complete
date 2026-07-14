import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HeaderComponent, NavLink } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  const links: NavLink[] = [
    { label: 'Articles', path: '/feed' },
    { label: 'Thèmes', path: '/topics' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('links', links);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Rend un lien par entrée fournie en input.
  it('should render one link per input entry', () => {
    const rendered = fixture.debugElement.queryAll(By.css('.header__link'));
    expect(rendered.length).toBe(2);
    expect((rendered[0].nativeElement as HTMLElement).textContent).toContain('Articles');
    expect((rendered[1].nativeElement as HTMLElement).textContent).toContain('Thèmes');
  });

  // Le logo n'est plus un lien (conforme maquette : "Articles" joue ce rôle).
  it('should render the brand as plain text, not a link', () => {
    const brand = fixture.debugElement.query(By.css('.header__brand'));
    expect(brand.nativeElement.tagName.toLowerCase()).toBe('span');
  });

  // Clic sur « Mon profil » (burger mobile) : émet l'output profile.
  it('should emit profile when the profile action is clicked', () => {
    const spy = jest.fn();
    component.profile.subscribe(spy);

    component.onProfile();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  // Clic sur « Se déconnecter » : émet l'output logout.
  it('should emit logout when the logout action is clicked', () => {
    const spy = jest.fn();
    component.logout.subscribe(spy);

    component.onLogout();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  // Le burger bascule l'état du menu mobile.
  it('should toggle the mobile menu', () => {
    expect(component.menuOpen()).toBe(false);
    fixture.debugElement.query(By.css('.header__burger')).nativeElement.click();
    expect(component.menuOpen()).toBe(true);
  });

  // toggleMenu referme aussi (branche open => !open dans le sens true → false).
  it('should toggle the mobile menu back to closed', () => {
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(false);
  });

  // Après une action, le menu mobile se referme.
  it('should close the menu on profile or logout', () => {
    component.toggleMenu();
    component.onProfile();
    expect(component.menuOpen()).toBe(false);

    component.toggleMenu();
    component.onLogout();
    expect(component.menuOpen()).toBe(false);
  });

  // L'icône utilisateur (desktop) déclenche le menu Material.
  it('should expose a user menu trigger', () => {
    expect(fixture.debugElement.query(By.css('.header__user'))).not.toBeNull();
  });

  // Échap ferme le panneau quand il est ouvert (branche menuOpen() vraie).
  it('should close the menu on Escape when it is open', () => {
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);

    component.onEscape();

    expect(component.menuOpen()).toBe(false);
  });

  // Échap ne fait rien quand le panneau est déjà fermé (branche menuOpen() fausse).
  it('should do nothing on Escape when the menu is already closed', () => {
    expect(component.menuOpen()).toBe(false);

    component.onEscape();

    expect(component.menuOpen()).toBe(false);
  });

  // L'effect bloque le défilement du body à l'ouverture, le restaure à la fermeture.
  it('should lock body scroll when open and restore it when closed', () => {
    // Ouverture : overflow passe à hidden.
    component.toggleMenu();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    // Fermeture : overflow restauré (chaîne vide).
    component.closeMenu();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('');
  });

  // Échap via l'événement clavier réel (couvre le HostListener, pas seulement la méthode).
  it('should close the menu on a real Escape keydown event', () => {
    component.toggleMenu();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(false);
  });
});