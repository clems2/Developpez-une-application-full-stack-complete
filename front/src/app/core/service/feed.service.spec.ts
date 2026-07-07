import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeedService } from './feed.service';
import { Post } from '../../models/post.model';

describe('FeedService', () => {
  let service: FeedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), FeedService],
    });
    service = TestBed.inject(FeedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // getFeed passe le paramètre order et renvoie la liste.
  it('getFeed_shouldRequestWithOrderParam_andReturnPosts', () => {
    const posts: Post[] = [
      { id: 1, title: 'A', content: 'c', author: 'leo', createdAt: '2026-01-01T10:00:00', topic: 'Java' },
    ];
    let received: Post[] | undefined;

    service.getFeed('desc').subscribe((r) => (received = r));

    const req = httpMock.expectOne((r) => r.url === '/api/feed');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('order')).toBe('desc');
    req.flush(posts);

    expect(received).toEqual(posts);
  });
});