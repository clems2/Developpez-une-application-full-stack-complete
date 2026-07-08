import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CommentService],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // create POSTe sur la sous-ressource et renvoie le commentaire créé.
  it('create_shouldPostToPostComments_andReturnComment', () => {
    const created = { id: 5, content: 'Bien vu', author: 'leo', createdAt: '2026-01-01T10:00:00' };
    let received: unknown;

    service.create(7, { content: 'Bien vu' }).subscribe((r) => (received = r));

    const req = httpMock.expectOne('/api/posts/7/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Bien vu' });
    req.flush(created);

    expect(received).toEqual(created);
  });
});