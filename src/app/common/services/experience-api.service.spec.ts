import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { Experience } from '@interfaces/experience.interface';
import { ExperienceApiService } from './experience-api.service';

describe('ExperienceApiService', () => {
  let service: ExperienceApiService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/users/experience`;
  const experience: Experience = {
    id: 0,
    company_name: 'ACME',
    role: 'Dev',
    description: '',
    start_date: '2020-01-01',
    end_date: 'Present',
    is_current: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ExperienceApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the experiences', () => {
    service.list().subscribe();
    expect(http.expectOne(url).request.method).toBe('GET');
  });

  it('saves an experience wrapped in the body', () => {
    service.save(experience).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ experience });
  });

  it('deletes an experience by id', () => {
    service.delete(3).subscribe();
    expect(http.expectOne(`${url}/3`).request.method).toBe('DELETE');
  });
});
