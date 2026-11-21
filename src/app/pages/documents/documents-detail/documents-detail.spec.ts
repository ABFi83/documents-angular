import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CurrentUserService } from '@common/services/current-user.service';
import { environment } from '@environments/environment';
import { CvDocument, Extraction, ProcessStatus } from '@interfaces/document.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { POLLING_INTERVAL_MS } from '@utils/polling';
import { vi } from 'vitest';
import { DocumentsDetail } from './documents-detail';

describe('DocumentsDetail', () => {
  let fixture: ComponentFixture<DocumentsDetail>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const currentUser = { reload: vi.fn() };
  const url = `${environment.apiBaseUrl}/documents/7`;
  const extraction: Extraction = {
    nome: 'Mario',
    cognome: 'Rossi',
    linguaggi: ['Python', 'Java'],
    frameworks: ['Angular'],
    esperienze: [
      { azienda: 'ACME', ruolo: 'Developer', start_date: '2020-09-01', end_date: null, description: 'Frontend\nAngular' },
      { azienda: 'Beta', ruolo: 'Intern', start_date: '2019-01-01', end_date: '2019-06-01', description: null }
    ]
  };

  const cv = (status: ProcessStatus, process: Partial<CvDocument['process']> = {}): CvDocument =>
    ({
      id: 7,
      title: 'cv.pdf',
      created_at: '2026-11-20T15:04:05',
      process: { status, error_message: null, result: null, ...process }
    }) as CvDocument;

  // RxJS schedules even the first `timer` tick through setInterval: let it fire, then answer.
  const answer = async (document: CvDocument): Promise<void> => {
    TestBed.tick();
    vi.advanceTimersByTime(0);
    http.expectOne(url).flush(document);
    await fixture.whenStable();
  };

  const text = (selector: string): string[] => [...element.querySelectorAll(selector)].map(item => item.textContent?.trim() ?? '');

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    document.documentElement.lang = 'it';
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: CurrentUserService, useValue: currentUser }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DocumentsDetail);
    fixture.componentRef.setInput('id', '7');
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('shows the extracted name, skills and experiences', async () => {
    await answer(cv('COMPLETED', { result: extraction }));

    expect(element.querySelector('h1')?.textContent).toContain('cv.pdf');
    expect(element.querySelector('[data-role="status"]')?.getAttribute('data-status')).toBe('COMPLETED');
    expect(text('[data-role="person"]')).toEqual(['Mario Rossi']);
    expect(text('[data-role="languages"] li')).toEqual(['Python', 'Java']);
    expect(text('[data-role="frameworks"] li')).toEqual(['Angular']);
    expect(text('ol h3')).toEqual(['Developer', 'Intern']);
    expect(text('[data-role="company"]')).toEqual(['ACME', 'Beta']);
    expect(text('[data-role="period"]')).toEqual(['set 2020 – DOCUMENTS.PRESENT', 'gen 2019 – giu 2019']);
    expect(text('[data-role="description"]')).toEqual(['Frontend\nAngular']);
  });

  it('says what was not detected', async () => {
    await answer(cv('COMPLETED', { result: { nome: null, cognome: null, linguaggi: [], frameworks: [], esperienze: [] } }));

    expect(text('[data-role="none"]')).toEqual(['DOCUMENTS.NOT_DETECTED', 'DOCUMENTS.NONE', 'DOCUMENTS.NONE', 'DOCUMENTS.NO_EXPERIENCES']);
  });

  it('shows the BE error when the analysis failed', async () => {
    await answer(cv('ERROR', { error_message: 'PDF illeggibile' }));

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('PDF illeggibile');
    expect(element.querySelector('[data-role="result"]')).toBeNull();
  });

  it('polls while the CV is under analysis', async () => {
    await answer(cv('PENDING'));
    expect(element.querySelector('[data-role="analyzing"]')).not.toBeNull();

    vi.advanceTimersByTime(POLLING_INTERVAL_MS);
    await answer(cv('COMPLETED', { result: extraction }));
    expect(element.querySelector('[data-role="analyzing"]')).toBeNull();
    expect(text('[data-role="person"]')).toEqual(['Mario Rossi']);
  });

  it('downloads the PDF under its title', async () => {
    await answer(cv('COMPLETED', { result: extraction }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    URL.createObjectURL = vi.fn(() => 'blob:cv');
    URL.revokeObjectURL = vi.fn();

    (element.querySelector('button[data-role="download"]') as HTMLButtonElement).click();
    http.expectOne(`${environment.apiBaseUrl}/documents/download/7`).flush(new Blob(['%PDF']));

    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('cv.pdf');
    expect(link.href).toBe('blob:cv');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:cv');
  });

  it('deletes the CV after the confirmation and goes back to the list', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await answer(cv('PENDING'));

    (element.querySelector('button[data-role="delete"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    (element.querySelector('app-confirm-dialog [data-role="confirm"]') as HTMLButtonElement).click();
    const req = http.expectOne(`${environment.apiBaseUrl}/documents/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(currentUser.reload).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/documents']);
  });
});
