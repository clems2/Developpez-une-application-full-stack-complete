import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthStore } from './auth.store';
import { TokenStorageService } from '../core/service/token-storage.service';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    tokenStorage = TestBed.inject(TokenStorageService);
    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // État initial : pas de session.
  it('should start empty and unauthenticated', () => {
    expect(store.token()).toBeNull();
    expect(store.status()).toBe('empty');
    expect(store.isAuthenticated()).toBe(false);
  });

  // login OK : token persisté + état loaded.
  it('login_shouldPersistTokenAndSetLoaded_onSuccess', () => {
    store.login({ identifier: 'alice@mail.fr', password: 'Passw0rd!' });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt-login' });

    expect(store.token()).toBe('jwt-login');
    expect(store.status()).toBe('loaded');
    expect(store.error()).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(tokenStorage.getToken()).toBe('jwt-login');
  });

  // login KO (401) : statut error + message, aucun token.
  it('login_shouldSetError_on401', () => {
    store.login({ identifier: 'alice@mail.fr', password: 'wrong' });

    httpMock
      .expectOne('/api/auth/login')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(store.token()).toBeNull();
    expect(store.status()).toBe('error');
    expect(store.error()).not.toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  // register OK : token persisté + état loaded.
  it('register_shouldPersistTokenAndSetLoaded_onSuccess', () => {
    store.register({ username: 'alice', email: 'alice@mail.fr', password: 'Passw0rd!' });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt-register' });

    expect(store.token()).toBe('jwt-register');
    expect(store.status()).toBe('loaded');
  });

  // vm : reflète loading puis loaded.
  it('vm_shouldReflectLoadingThenLoaded', () => {
    store.login({ identifier: 'a', password: 'b' });
    expect(store.vm().isLoading).toBe(true);

    httpMock.expectOne('/api/auth/login').flush({ token: 'jwt' });
    expect(store.vm().isLoading).toBe(false);
    expect(store.vm().isAuthenticated).toBe(true);
  });

  // logout : purge token (état + storage).
  it('logout_shouldClearTokenAndState', () => {
    store.login({ identifier: 'a', password: 'b' });
    httpMock.expectOne('/api/auth/login').flush({ token: 'jwt' });

    store.logout();

    expect(store.token()).toBeNull();
    expect(store.status()).toBe('empty');
    expect(tokenStorage.getToken()).toBeNull();
  });
});

describe('AuthStore hydration', () => {
  // onInit : réhydrate l'état depuis un token déjà persistant.
  it('onInit_shouldHydrateTokenFromStorage', () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(TokenStorageService).setToken('persisted-jwt');

    const store = TestBed.inject(AuthStore);

    expect(store.token()).toBe('persisted-jwt');
    expect(store.status()).toBe('loaded');
  });
});