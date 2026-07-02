import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TopicCardComponent } from './topic-card.component';
import { Topic } from '../../models/topic.model';

describe('TopicCardComponent', () => {
  let fixture: ComponentFixture<TopicCardComponent>;
  let component: TopicCardComponent;

  const baseTopic: Topic = {
    id: 1,
    title: 'Angular',
    description: 'Framework front',
    subscribed: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TopicCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', baseTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Non abonné : bouton actif « S'abonner », émet l'id au clic.
  it('should emit subscribe with the topic id when clicked', () => {
    const spy = jest.fn();
    component.subscribe.subscribe(spy);

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain("S'abonner");

    button.click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  // Déjà abonné : bouton inactif « Déjà abonné » (specs).
  it('should show a disabled "Déjà abonné" button when subscribed', () => {
    fixture.componentRef.setInput('topic', { ...baseTopic, subscribed: true });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Déjà abonné');
  });
});