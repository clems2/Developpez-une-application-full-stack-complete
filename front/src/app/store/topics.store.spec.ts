import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TopicsStore } from './topics.store';

describe('TopicsStore', () => {
  let store: InstanceType<typeof TopicsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(TopicsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // subscribe : passe le flag subscribed du bon sujet à true après confirmation serveur.
  it('subscribe_shouldFlagTopicAsSubscribed_afterServerConfirms', () => {
    store.loadTopics();
    httpMock.expectOne('/api/topics').flush([
      { id: 1, title: 'A', description: 'a', subscribed: false },
      { id: 2, title: 'B', description: 'b', subscribed: false },
    ]);

    store.subscribe(1);
    const req = httpMock.expectOne('/api/topics/1/subscribe');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(store.topics().find((t) => t.id === 1)?.subscribed).toBe(true);
    expect(store.topics().find((t) => t.id === 2)?.subscribed).toBe(false);
  });
});