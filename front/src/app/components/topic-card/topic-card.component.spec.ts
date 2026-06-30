import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Topic } from '../../models/topic.model';
import { TopicCardComponent } from './topic-card.component';

describe('TopicCardComponent', () => {
  let fixture: ComponentFixture<TopicCardComponent>;
  const topic: Topic = { id: 1, title: 'Java', description: 'Langage JVM' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TopicCardComponent);
  });

  it('should create', () => {
    fixture.componentRef.setInput('topic', topic);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the topic title and description', () => {
    fixture.componentRef.setInput('topic', topic);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Java');
    expect(text).toContain('Langage JVM');
  });
});