import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ArticleCreateComponent } from './article-create.component';
import { TopicsStore } from '../../store/topics.store';

describe('ArticleCreateComponent', () => {
  let fixture: ComponentFixture<ArticleCreateComponent>;
  let component: ArticleCreateComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ArticleCreateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Pré-charge des sujets dans TopicsStore (2 abonnés, 1 non abonné).
    const topicsStore = TestBed.inject(TopicsStore);
    topicsStore.loadTopics();
    httpMock.expectOne('/api/topics').flush([
      { id: 1, title: 'Java', description: 'a', subscribed: true },
      { id: 2, title: 'Angular', description: 'b', subscribed: false },
      { id: 3, title: 'Spring', description: 'c', subscribed: true },
    ]);

    fixture = TestBed.createComponent(ArticleCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // ngOnInit voit le store déjà peuplé → pas de second appel /api/topics.
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Le select ne propose que les sujets abonnés (règle tuteur).
  it('should only expose subscribed topics in the select', () => {
    expect(component.subscribedTopics().length).toBe(2);
    expect(component.subscribedTopics().every((t) => t.subscribed)).toBe(true);
  });

  // Formulaire vide : invalide, pas d'appel réseau au submit.
  it('should not submit when invalid', () => {
    component.submit();
    httpMock.expectNone('/api/posts');
    expect(component.form.invalid).toBe(true);
  });

  // Création OK : POST /api/posts puis navigation vers /feed.
  it('should create the article and navigate to /feed', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ topicId: 1, title: 'Mon titre', content: 'Mon contenu' });
    component.submit();

    httpMock
      .expectOne('/api/posts')
      .flush({ id: 5, title: 'Mon titre', content: 'Mon contenu', author: 'leo', createdAt: '2026-01-01T10:00:00', topic: 'Java' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/feed']);
  });

  // 403 : message d'erreur affiché, pas de navigation.
  it('should show an error and not navigate on 403', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ topicId: 1, title: 'T', content: 'C' });
    component.submit();

    httpMock.expectOne('/api/posts').flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('.article-form__error'))).not.toBeNull();
  });
});