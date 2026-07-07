import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticlesStore } from './articles.store';

describe('ArticlesStore', () => {
  let store: InstanceType<typeof ArticlesStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ArticlesStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // Création OK : status loaded, isCreated vrai.
  it('create_shouldSetLoaded_onSuccess', () => {
    store.create({ topicId: 1, title: 'T', content: 'C' });
    httpMock
      .expectOne('/api/posts')
      .flush({ id: 1, title: 'T', content: 'C', author: 'leo', createdAt: '2026-01-01T10:00:00', topic: 'Java' });

    expect(store.status()).toBe('loaded');
    expect(store.isCreated()).toBe(true);
  });

  // 403 non abonné : message dédié (règle tuteur, défense en profondeur).
  it('create_shouldMap403_toNotSubscribedMessage', () => {
    store.create({ topicId: 1, title: 'T', content: 'C' });
    httpMock.expectOne('/api/posts').flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(store.status()).toBe('error');
    expect(store.error()).toContain("pas abonné");
  });

  // 404 sujet introuvable : message dédié.
  it('create_shouldMap404_toTopicNotFoundMessage', () => {
    store.create({ topicId: 99, title: 'T', content: 'C' });
    httpMock.expectOne('/api/posts').flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(store.error()).toContain('introuvable');
  });
});