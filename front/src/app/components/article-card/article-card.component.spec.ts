import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ArticleCardComponent } from './article-card.component';
import { Post } from '../../models/post.model';

describe('ArticleCardComponent', () => {
  let fixture: ComponentFixture<ArticleCardComponent>;

  const longPost: Post = {
    id: 1,
    title: 'Titre',
    content: 'x'.repeat(200),
    author: 'leo',
    createdAt: '2026-01-01T10:00:00',
    topic: 'Java',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCardComponent);
    fixture.componentRef.setInput('post', longPost);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // Affiche titre, auteur et thème.
  it('should render title, author and topic', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Titre');
    expect(text).toContain('leo');
    expect(text).toContain('Java');
  });

  // Contenu long : tronqué avec ellipse.
  it('should truncate long content with an ellipsis', () => {
    const excerpt = fixture.debugElement.query(By.css('.article-card__excerpt'))
      .nativeElement as HTMLElement;
    expect(excerpt.textContent?.endsWith('…')).toBe(true);
    expect((excerpt.textContent ?? '').length).toBeLessThan(200);
  });
});