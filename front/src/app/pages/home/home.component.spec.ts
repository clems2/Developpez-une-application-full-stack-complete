import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Les deux accès (login/register) sont présents et pointent vers les bonnes routes.
  it('should expose links to /login and /register', () => {
    const links = fixture.debugElement.queryAll(By.css('a[routerLink]'));
    const targets = links.map(
      (l) => l.attributes['ng-reflect-router-link'] ?? l.attributes['routerLink'],
    );
    expect(targets).toContain('/login');
    expect(targets).toContain('/register');
  });
});