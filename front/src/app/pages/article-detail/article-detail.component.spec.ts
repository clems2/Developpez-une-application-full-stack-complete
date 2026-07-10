import { afterEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormGroupDirective } from '@angular/forms';
import { provideRouter } from '@angular/router';
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

  const createdComment = {
    id: 42,
    content: 'Mon commentaire',
    author: 'leo',
    createdAt: '2026-01-03T10:00:00',
  };

  async function setup(id: number): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    fixture.componentRef.setInput('id', id); // simule le binding de route
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // effect → loadDetail
  }

  /** Charge l'article 7 et stabilise la vue. Facteur commun des tests de commentaire. */
  async function loadArticle(): Promise<void> {
    await setup(7);
    httpMock.expectOne('/api/posts/7').flush(detail);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  // Charge l'article de la route et affiche titre, contenu et commentaires.
  it('should load and render the article with its comments', async () => {
    await loadArticle();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mon article');
    expect(text).toContain('Contenu complet');
    expect(text).toContain('Super');
    expect(text).toContain('Commentaires (1)');
  });

  // 404 : message d'erreur.
  it('should show an error when the article is not found', async () => {
    await setup(99);
    httpMock.expectOne('/api/posts/99').flush('Not Found', { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.detail__error'))).not.toBeNull();
  });

  // Ajout d'un commentaire : POST puis le commentaire apparaît dans la liste.
  it('should add a comment and render it', async () => {
    await loadArticle();

    fixture.componentInstance.commentForm.setValue({ content: 'Mon commentaire' });
    fixture.componentInstance.submitComment();

    httpMock.expectOne('/api/posts/7/comments').flush(createdComment);
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mon commentaire');
    expect(text).toContain('Commentaires (2)');
  });

  /**
   * Non-régression : le champ ne doit pas rester en erreur après un ajout réussi.
   *
   * Deux points de fidélité par rapport au navigateur, indispensables ici :
   * 1. la soumission passe par un vrai événement `submit` sur le <form>, seul moyen de faire
   *    passer `FormGroupDirective` par l'état `submitted` sur lequel Material s'appuie ;
   * 2. un cycle de détection de changement s'intercale AVANT le `flush()`. En production le
   *    réseau est asynchrone et Angular exécute ce cycle pendant que la requête est en vol ;
   *    `flush()` étant synchrone, sans lui l'`effect()` n'observerait jamais l'état `loading`
   *    et ne détecterait donc pas la transition envoi → succès.
   */
  it('should clear the submitted state after a successful comment submission', async () => {
    await loadArticle();

    const formDebug = fixture.debugElement.query(By.css('.comment-form'));
    const field = fixture.debugElement.query(By.css('.comment-form__field'))
      .nativeElement as HTMLElement;
    const textarea = fixture.debugElement.query(By.css('.comment-form textarea'))
      .nativeElement as HTMLTextAreaElement;

    textarea.value = 'Mon commentaire';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    formDebug.triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges(); // l'effect observe l'envoi en cours (cf. point 2 ci-dessus)

    expect(formDebug.injector.get(FormGroupDirective).submitted).toBe(true);

    httpMock.expectOne('/api/posts/7/comments').flush(createdComment);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(formDebug.injector.get(FormGroupDirective).submitted).toBe(false);
    expect(fixture.componentInstance.commentForm.controls.content.value).toBe('');
    expect(field.classList.contains('mat-form-field-invalid')).toBe(false);
  });
});