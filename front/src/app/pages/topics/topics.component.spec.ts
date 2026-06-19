import { expect } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Topic } from '../../models/topic.model';
import { TopicsComponent } from './topics.component';

describe('TopicsComponent', () => {
  let fixture: ComponentFixture<TopicsComponent>;
  let httpMock: HttpTestingController;

  const mockTopics: Topic[] = [
    { id: 1, title: 'Java', description: 'Langage JVM' },
    { id: 2, title: 'Angular', description: 'Framework front' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(TopicsComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load topics on init and render one card per topic', async () => {
    fixture.detectChanges(); // ngOnInit -> loadTopics -> requête HTTP

    const req = httpMock.expectOne('/api/topics');
    expect(req.request.method).toBe('GET');
    req.flush(mockTopics);

    await fixture.whenStable();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-topic-card'));
    expect(cards.length).toBe(2);
  });

  it('should show an empty message when no topic is returned', async () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/topics').flush([]);

    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Aucun sujet',
    );
  });

  it('should show an error message when the request fails', async () => {
    fixture.detectChanges();
    httpMock
      .expectOne('/api/topics')
      .flush('error', { status: 500, statusText: 'Server Error' });

    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'erreur',
    );
  });
});