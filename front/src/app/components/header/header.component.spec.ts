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
});