import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenStorageService } from '../core/service/token-storage.service';

describe('authGuard', () => {
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TokenStorageService, provideRouter([])],
    });
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  // Token présent : accès autorisé.
  it('should allow activation when a token is present', () => {
    tokenStorage.setToken('jwt');
    expect(run()).toBe(true);
  });

  // Pas de token : redirection vers /login (UrlTree).
  it('should redirect to /login when no token', () => {
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});