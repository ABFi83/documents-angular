import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpFeedbackService } from '@common/services/http-feedback.service';
import { SessionService } from '@common/services/session.service';
import { provideTranslateService } from '@ngx-translate/core';
import { httpInterceptor } from './http.interceptor';

describe('httpInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let feedback: HttpFeedbackService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpInterceptor])), provideHttpClientTesting(), provideTranslateService()]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    feedback = TestBed.inject(HttpFeedbackService);
  });

  afterEach(() => backend.verify());

  it('sends the session token as bearer', () => {
    TestBed.inject(SessionService).setToken('jwt');
    http.get('/api').subscribe();
    expect(backend.expectOne('/api').request.headers.get('Authorization')).toBe('Bearer jwt');
  });

  it('sends no authorization header without a session', () => {
    http.get('/api').subscribe();
    expect(backend.expectOne('/api').request.headers.has('Authorization')).toBe(false);
  });

  it('shows a snackbar for a known error status and rethrows it', () => {
    let status: number | undefined;
    http.get('/api').subscribe({ error: error => (status = error.status) });
    backend.expectOne('/api').flush(null, { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
    expect(feedback.notifications().map(item => item.message)).toEqual(['COMMON.HTTP_ERRORS.NOT_FOUND']);
  });

  it('leaves the other errors to the caller', () => {
    http.get('/api').subscribe({ error: () => undefined });
    backend.expectOne('/api').flush(null, { status: 400, statusText: 'Bad Request' });
    expect(feedback.notifications()).toEqual([]);
  });
});
