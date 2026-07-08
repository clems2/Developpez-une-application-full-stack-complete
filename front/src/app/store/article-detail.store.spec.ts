import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticleDetailStore } from './article-detail.store';
import { PostDetail } from '../models/post-detail.model';

describe('ArticleDetailStore', () => {
  let store: InstanceType<typeof ArticleDetailStore>;
  let httpMock: HttpTestingController;

  const detail: PostDetail = {
    id: 1,
    title: 'T',
    content: 'C',
    author: 'leo',
    createdAt: '2026-01-01T10:00:00',
    topic: 'Java',
    comments: [{ id: 1, content: 'Bien', author: 'mia', createdAt: '2026-01-02T09:00:00' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ArticleDetailStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // loadDetail OK : post chargé + loaded.
  it('loadDetail_shouldSetPostAndLoaded_onSuccess', () => {
    store.loadDetail(1);
    const req = httpMock.expectOne('/api/posts/1');
    expect(req.request.method).toBe('GET');
    req.flush(detail);

    expect(store.post()).toEqual(detail);
    expect(store.status()).toBe('loaded');
  });

  // 404 : status error, post null.
  it('loadDetail_shouldSetError_on404', () => {
    store.loadDetail(99);
    httpMock.expectOne('/api/posts/99').flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(store.post()).toBeNull();
    expect(store.status()).toBe('error');
  });
});