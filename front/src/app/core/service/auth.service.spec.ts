import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // register POSTe le corps tel quel sur /api/auth/register et renvoie le token.
  it('register_shouldPostCredentials_andReturnToken', () => {
    const payload: RegisterRequest = { username: 'alice', email: 'alice@mail.fr', password: 'Passw0rd!' };
    const response: AuthResponse = { token: 'jwt-register' };
    let received: AuthResponse | undefined;

    service.register(payload).subscribe((r) => (received = r));

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);

    expect(received).toEqual(response);
  });

  // login POSTe identifier + password sur /api/auth/login.
  it('login_shouldPostCredentials_andReturnToken', () => {
    const payload: LoginRequest = { identifier: 'alice@mail.fr', password: 'Passw0rd!' };
    const response: AuthResponse = { token: 'jwt-login' };
    let received: AuthResponse | undefined;

    service.login(payload).subscribe((r) => (received = r));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);

    expect(received).toEqual(response);
  });

  // Mauvais identifiants : le 401 est propagé à l'appelant (le store en fera un message).
  it('login_shouldPropagateError_onUnauthorized', () => {
    const payload: LoginRequest = { identifier: 'alice@mail.fr', password: 'wrong' };
    let status: number | undefined;

    service.login(payload).subscribe({
      next: () => {
        /* ne doit pas se produire */
      },
      error: (err) => (status = err.status),
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(status).toBe(401);
  });
});