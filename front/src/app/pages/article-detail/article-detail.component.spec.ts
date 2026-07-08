import { afterEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ArticleDetailComponent } from './article-detail.component';
import { PostDetail } from '../../models/post-detail.model';

describe('ArticleDetailComponent', () => {
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let httpMock: HttpTestingController;

  const detail: PostDetail = {
    id: 7,
    title: 'Mon article',
    content: 'Contenu complet',
    author: 'leo',
    createdAt: '2026-01-01T10:00:00',
    topic: 'Java',
    comments: [{ id: 1, content: 'Super', author: 'mia', createdAt: '2026-01-02T09:00:00' }],
  };

  async function setup(id: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // ngOnInit → loadDetail
  }

  afterEach(() => httpMock.verify());

  // Charge l'article de la route et affiche titre, contenu et commentaires.
  it('should load and render the article with its comments', async () => {
    await setup('7');
    httpMock.expectOne('/api/posts/7').flush(detail);
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mon article');
    expect(text).toContain('Contenu complet');
    expect(text).toContain('Super'); // commentaire
    expect(text).toContain('Commentaires (1)');
  });

  // 404 : message d'erreur.
  it('should show an error when the article is not found', async () => {
    await setup('99');
    httpMock.expectOne('/api/posts/99').flush('Not Found', { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.detail__error'))).not.toBeNull();
  });
});