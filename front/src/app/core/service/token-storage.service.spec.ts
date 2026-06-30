import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear(); // isolation : pas de fuite d'état entre tests
    TestBed.configureTestingModule({ providers: [TokenStorageService] });
    service = TestBed.inject(TokenStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Aucune session : getToken renvoie null.
  it('getToken_shouldReturnNull_whenNoTokenStored', () => {
    expect(service.getToken()).toBeNull();
  });

  // Aller-retour nominal set → get.
  it('setToken_shouldPersistToken_readableByGetToken', () => {
    service.setToken('jwt-abc');
    expect(service.getToken()).toBe('jwt-abc');
  });

  // Re-login : le nouveau token écrase l'ancien.
  it('setToken_shouldOverwritePreviousToken', () => {
    service.setToken('old');
    service.setToken('new');
    expect(service.getToken()).toBe('new');
  });

  // Déconnexion / 401 : clear supprime le token.
  it('clear_shouldRemoveToken', () => {
    service.setToken('jwt-abc');
    service.clear();
    expect(service.getToken()).toBeNull();
  });
});