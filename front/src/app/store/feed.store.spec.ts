import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeedStore } from './feed.store';
import { Post } from '../models/post.model';

describe('FeedStore', () => {
  let store: InstanceType<typeof FeedStore>;
  let httpMock: HttpTestingController;

  const posts: Post[] = [
    { id: 1, title: 'A', content: 'c', author: 'leo', createdAt: '2026-01-02T10:00:00', topic: 'Java' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(FeedStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // État initial : vide, tri desc.
  it('should start empty with desc order', () => {
    expect(store.status()).toBe('empty');
    expect(store.order()).toBe('desc');
  });

  // loadFeed OK : posts + loaded.
  it('loadFeed_shouldSetPostsAndLoaded_onSuccess', () => {
    store.loadFeed();
    httpMock.expectOne((r) => r.url === '/api/feed').flush(posts);

    expect(store.posts()).toEqual(posts);
    expect(store.status()).toBe('loaded');
    expect(store.vm().isEmpty).toBe(false);
  });

  // Fil vide : isEmpty vrai.
  it('loadFeed_shouldFlagEmpty_whenNoPost', () => {
    store.loadFeed();
    httpMock.expectOne((r) => r.url === '/api/feed').flush([]);

    expect(store.vm().isEmpty).toBe(true);
  });

  // Erreur : status error.
  it('loadFeed_shouldSetError_onFailure', () => {
    store.loadFeed();
    httpMock
      .expectOne((r) => r.url === '/api/feed')
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(store.status()).toBe('error');
  });

  // setOrder : change l'ordre et recharge (nouvelle requête avec asc).
  it('setOrder_shouldUpdateOrderAndReload', () => {
    store.setOrder('asc');
    const req = httpMock.expectOne((r) => r.url === '/api/feed');
    expect(req.request.params.get('order')).toBe('asc');
    req.flush(posts);

    expect(store.order()).toBe('asc');
    expect(store.status()).toBe('loaded');
  });
});