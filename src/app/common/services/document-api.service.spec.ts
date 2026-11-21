import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { DocumentApiService } from './document-api.service';

describe('DocumentApiService', () => {
  let service: DocumentApiService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/documents`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DocumentApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads every file in the repeated `files` field', () => {
    const files = [new File(['%PDF'], 'a.pdf'), new File(['%PDF'], 'b.pdf')];
    service.upload(files).subscribe();

    const req = http.expectOne(url);
    const body = req.request.body as FormData;
    expect(req.request.method).toBe('POST');
    expect((body.getAll('files') as File[]).map(file => file.name)).toEqual(['a.pdf', 'b.pdf']);
    expect(body.get('metadata')).toBe('');
  });

  it('gets the CV list', () => {
    service.list().subscribe();
    expect(http.expectOne(url).request.method).toBe('GET');
  });

  it('gets the summary of the CVs', () => {
    service.summary().subscribe();
    expect(http.expectOne(`${url}/summary`).request.method).toBe('GET');
  });

  it('gets a CV by id', () => {
    service.get(7).subscribe();
    expect(http.expectOne(`${url}/7`).request.method).toBe('GET');
  });

  it('downloads the PDF as a blob', () => {
    service.download(7).subscribe();
    const req = http.expectOne(`${url}/download/7`);
    expect(req.request.responseType).toBe('blob');
  });

  it('deletes a CV by id', () => {
    service.delete(7).subscribe();
    expect(http.expectOne(`${url}/7`).request.method).toBe('DELETE');
  });
});
