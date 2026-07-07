import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FeedComponent } from './feed.component';
import { Post } from '../../models/post.model';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let httpMock: HttpTestingController;

  const posts: Post[] = [
    { id: 1, title: 'A', content: 'c', author: 'leo', createdAt: '2026-01-02T10:00:00', topic: 'Java' },
    { id: 2, title: 'B', content: 'c', author: 'mia', createdAt: '2026-01-01T10:00:00', topic: 'Angular' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // Charge le fil à l'init et rend une carte par article.
  it('should load the feed on init and render one card per post', async () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/feed').flush(posts);
    await fixture.whenStable();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-article-card'));
    expect(cards.length).toBe(2);
  });

  // Fil vide : message d'état vide.
  it('should show the empty message when the feed is empty', async () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/feed').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Aucun feed car vous n'êtes abonné à aucun thème.",
    );
  });

  // Toggle tri : relance une requête avec order=asc.
  it('should reload with asc order when toggling sort', async () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === '/api/feed').flush(posts);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    const req = httpMock.expectOne((r) => r.url === '/api/feed');
    expect(req.request.params.get('order')).toBe('asc');
    req.flush(posts);
  });
});