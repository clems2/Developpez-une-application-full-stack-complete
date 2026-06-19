import { expect } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Topic } from '../../models/topic.model';
import { TopicService } from './topic.service';

describe('TopicService', () => {
  let service: TopicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TopicService],
    });
    service = TestBed.inject(TopicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all topics from /api/topics', () => {
    const mockTopics: Topic[] = [
      { id: 1, title: 'Java', description: 'Langage JVM' },
      { id: 2, title: 'Angular', description: 'Framework front' },
    ];
    let result: Topic[] | undefined;

    service.getAll().subscribe((topics) => (result = topics));

    const req = httpMock.expectOne('/api/topics');
    expect(req.request.method).toBe('GET');
    req.flush(mockTopics);

    expect(result).toEqual(mockTopics);
  });
});