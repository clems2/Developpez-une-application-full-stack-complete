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
    { label: 'Thèmes', path: '/topics' },
    { label: 'Articles', path: '/articles' },
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
    expect((rendered[0].nativeElement as HTMLElement).textContent).toContain('Thèmes');
  });

  // Clic sur « Se déconnecter » : émet l'output logout.
  it('should emit logout when the logout button is clicked', () => {
    const spy = jest.fn();
    component.logout.subscribe(spy);

    fixture.debugElement.query(By.css('.header__logout')).nativeElement.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  // Le burger bascule l'état du menu mobile.
  it('should toggle the mobile menu', () => {
    expect(component.menuOpen()).toBe(false);
    fixture.debugElement.query(By.css('.header__burger')).nativeElement.click();
    expect(component.menuOpen()).toBe(true);
  });

  // Après déconnexion, le menu mobile se referme.
  it('should close the menu on logout', () => {
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);

    component.onLogout();

    expect(component.menuOpen()).toBe(false);
  });
});