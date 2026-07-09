import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProfile_shouldGetMe', () => {
    service.getProfile().subscribe();
    const req = httpMock.expectOne('/api/me');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, username: 'leo', email: 'leo@mail.fr', subscriptions: [] });
  });

  it('updateProfile_shouldPutMe', () => {
    const payload = { username: 'leo', email: 'leo@mail.fr', password: '' };
    service.updateProfile(payload).subscribe();
    const req = httpMock.expectOne('/api/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, username: 'leo', email: 'leo@mail.fr', subscriptions: [] });
  });
});