import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { SkillApiService } from './skill-api.service';

describe('SkillApiService', () => {
  let service: SkillApiService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/users/skill`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SkillApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('saves the whole skill list', () => {
    const skills = [{ id: 5, name: 'Angular' }];
    service.save(skills).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ skills });
    req.flush({});
  });

  it('deletes a skill by id', () => {
    service.delete(5).subscribe();
    expect(http.expectOne(`${url}/5`).request.method).toBe('DELETE');
  });
});
