import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { UserApiService } from './user-api.service';

describe('UserApiService', () => {
  let service: UserApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UserApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the user', () => {
    service.get().subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('resets the user', () => {
    service.reset().subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/users/reset`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
