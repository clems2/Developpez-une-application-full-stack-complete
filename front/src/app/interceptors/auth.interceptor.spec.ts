import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import {
  HttpEvent,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from '../core/service/token-storage.service';

describe('authInterceptor', () => {
  let tokenStorage: TokenStorageService;
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    localStorage.clear();
    routerMock = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [TokenStorageService, { provide: Router, useValue: routerMock }],
    });
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  // Requête protégée + token : Bearer ajouté.
  it('should add Authorization header when token present and not an auth endpoint', () => {
    tokenStorage.setToken('jwt-abc');
    const req = new HttpRequest('GET', '/api/topics');
    let captured: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (r) => {
      captured = r;
      return of({} as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => authInterceptor(req, next).subscribe());

    expect(captured?.headers.get('Authorization')).toBe('Bearer jwt-abc');
  });

  // Endpoint d'auth : jamais de Bearer (même si un token traîne).
  it('should NOT add header on /api/auth endpoints', () => {
    tokenStorage.setToken('jwt-abc');
    const req = new HttpRequest('POST', '/api/auth/login', {});
    let captured: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (r) => {
      captured = r;
      return of({} as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => authInterceptor(req, next).subscribe());

    expect(captured?.headers.get('Authorization')).toBeNull();
  });

  // Pas de token : pas de Bearer.
  it('should NOT add header when no token', () => {
    const req = new HttpRequest('GET', '/api/topics');
    let captured: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (r) => {
      captured = r;
      return of({} as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => authInterceptor(req, next).subscribe());

    expect(captured?.headers.get('Authorization')).toBeNull();
  });

  // 401 sur route protégée : purge + redirect /login.
  it('should clear token and redirect on 401 for a protected route', () => {
    tokenStorage.setToken('jwt-abc');
    const req = new HttpRequest('GET', '/api/feed');
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));

    TestBed.runInInjectionContext(() =>
      authInterceptor(req, next).subscribe({ error: () => undefined }),
    );

    expect(tokenStorage.getToken()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // 401 sur /api/auth (login raté) : aucun purge ni redirect.
  it('should NOT clear or redirect on 401 for /api/auth', () => {
    tokenStorage.setToken('jwt-abc');
    const req = new HttpRequest('POST', '/api/auth/login', {});
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));

    TestBed.runInInjectionContext(() =>
      authInterceptor(req, next).subscribe({ error: () => undefined }),
    );

    expect(tokenStorage.getToken()).toBe('jwt-abc');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});