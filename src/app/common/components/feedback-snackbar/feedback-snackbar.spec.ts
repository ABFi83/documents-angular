import { TestBed } from '@angular/core/testing';
import { HttpFeedbackService } from '@common/services/http-feedback.service';
import { provideTranslateService } from '@ngx-translate/core';
import { FeedbackSnackbar } from './feedback-snackbar';

describe('FeedbackSnackbar', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTranslateService()] }));

  it('shows each error and closes it from its button', async () => {
    const feedback = TestBed.inject(HttpFeedbackService);
    feedback.notifyError('Boom');
    const fixture = TestBed.createComponent(FeedbackSnackbar);
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('li[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain('Boom');

    (alert.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('li')).toBeNull();
  });
});
