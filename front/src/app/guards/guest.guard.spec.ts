import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { guestGuard } from './guest.guard';
import { TokenStorageService } from '../core/service/token-storage.service';

describe('guestGuard', () => {
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
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  // Aucun token : accès autorisé à la route publique.
  it('should allow activation when no token (visitor)', () => {
    expect(run()).toBe(true);
  });

  // Token présent : redirection vers /feed (UrlTree).
  it('should redirect to /feed when a token is present', () => {
    tokenStorage.setToken('jwt');
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/feed');
  });
});