import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfileStore } from './profile.store';
import { UserProfile } from '../models/user-profile.model';

describe('ProfileStore', () => {
  let store: InstanceType<typeof ProfileStore>;
  let httpMock: HttpTestingController;

  const profile: UserProfile = {
    id: 1,
    username: 'leo',
    email: 'leo@mail.fr',
    subscriptions: [
      { id: 1, title: 'Java', description: 'a', subscribed: true },
      { id: 2, title: 'Angular', description: 'b', subscribed: true },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ProfileStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadProfile_shouldSetProfileAndLoaded', () => {
    store.loadProfile();
    httpMock.expectOne('/api/me').flush(profile);
    expect(store.profile()).toEqual(profile);
    expect(store.status()).toBe('loaded');
  });

  it('updateProfile_shouldSucceed', () => {
    store.loadProfile();
    httpMock.expectOne('/api/me').flush(profile);

    store.updateProfile({ username: 'leo2', email: 'leo@mail.fr', password: '' });
    httpMock.expectOne('/api/me').flush({ ...profile, username: 'leo2' });

    expect(store.updateStatus()).toBe('loaded');
    expect(store.vm().updateSucceeded).toBe(true);
  });

  it('updateProfile_shouldMap409', () => {
    store.loadProfile();
    httpMock.expectOne('/api/me').flush(profile);

    store.updateProfile({ username: 'taken', email: 'leo@mail.fr', password: '' });
    httpMock.expectOne('/api/me').flush('Conflict', { status: 409, statusText: 'Conflict' });

    expect(store.updateStatus()).toBe('error');
    expect(store.updateError()).toContain('déjà utilisé');
  });

  it('unsubscribe_shouldRemoveTopicFromSubscriptions', () => {
    store.loadProfile();
    httpMock.expectOne('/api/me').flush(profile);

    store.unsubscribe(1);
    httpMock.expectOne('/api/topics/1/subscribe').flush(null);

    expect(store.profile()?.subscriptions.length).toBe(1);
    expect(store.profile()?.subscriptions.find((t) => t.id === 1)).toBeUndefined();
  });
});