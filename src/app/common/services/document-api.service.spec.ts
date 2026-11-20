import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { DocumentApiService } from './document-api.service';

describe('DocumentApiService', () => {
  let service: DocumentApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DocumentApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads the file as multipart form data', () => {
    const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' });
    service.upload('cv.pdf', '', file).subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/documents`);
    const body = req.request.body as FormData;
    expect(req.request.method).toBe('POST');
    expect(body.get('title')).toBe('cv.pdf');
    expect(body.get('metadata')).toBe('');
    expect((body.get('file') as File).name).toBe('cv.pdf');
  });

  it('gets a process by id', () => {
    service.process(7).subscribe();
    expect(http.expectOne(`${environment.apiBaseUrl}/process/7`).request.method).toBe('GET');
  });
});
