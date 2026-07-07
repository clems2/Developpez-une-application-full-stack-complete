import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { CreatePostRequest } from '../../models/create-post.model';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PostService],
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // create POSTe le corps sur /api/posts et renvoie l'article créé.
  it('create_shouldPostPayload_andReturnCreatedPost', () => {
    const payload: CreatePostRequest = { topicId: 1, title: 'T', content: 'C' };
    let received: unknown;

    service.create(payload).subscribe((r) => (received = r));

    const req = httpMock.expectOne('/api/posts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 10, title: 'T', content: 'C', author: 'leo', createdAt: '2026-01-01T10:00:00', topic: 'Java' });

    expect(received).toBeTruthy();
  });
});