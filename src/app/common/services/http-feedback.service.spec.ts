import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HttpFeedbackService } from './http-feedback.service';

describe('HttpFeedbackService', () => {
  let service: HttpFeedbackService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(HttpFeedbackService);
  });

  afterEach(() => vi.useRealTimers());

  it('adds an error once, even when notified twice', () => {
    service.notifyError('Boom');
    service.notifyError('Boom');
    expect(service.notifications().map(item => item.message)).toEqual(['Boom']);
  });

  it('dismisses an error on demand and after 3 seconds', () => {
    service.notifyError('First');
    service.notifyError('Second');
    service.dismiss(service.notifications()[0].id);
    expect(service.notifications().map(item => item.message)).toEqual(['Second']);

    vi.advanceTimersByTime(3000);
    expect(service.notifications()).toEqual([]);
  });
});
