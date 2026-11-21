import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { DocumentUpload } from '@common/components/document-upload/document-upload';
import { environment } from '@environments/environment';
import { CvDocument, ProcessStatus } from '@interfaces/document.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { POLLING_INTERVAL_MS } from '@utils/polling';
import { vi } from 'vitest';
import { DocumentsHistory } from './documents-history';

describe('DocumentsHistory', () => {
  let fixture: ComponentFixture<DocumentsHistory>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const url = `${environment.apiBaseUrl}/documents`;

  const cv = (id: number, status: ProcessStatus): CvDocument =>
    ({ id, title: `cv-${id}.pdf`, created_at: '2026-11-20T15:04:05', process: { status } }) as CvDocument;

  // RxJS schedules even the first `timer` tick through setInterval: let it fire, then answer.
  const answer = async (documents: CvDocument[]): Promise<void> => {
    TestBed.tick();
    vi.advanceTimersByTime(0);
    http.expectOne(url).flush(documents);
    await fixture.whenStable();
  };

  const statuses = (): (string | null)[] =>
    [...element.querySelectorAll('[data-role="status"]')].map(item => item.getAttribute('data-status'));

  beforeEach(() => {
    // Only the polling timer: faking every timer would also stop Angular's change detection scheduler.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DocumentsHistory);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('lists the CVs with title, date, status and a link to the detail', async () => {
    await answer([cv(2, 'COMPLETED'), cv(1, 'ERROR')]);

    const links = [...element.querySelectorAll('li a')];
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/documents/2', '/documents/1']);
    expect(links[0].textContent).toContain('cv-2.pdf');
    expect(links[0].querySelector('[data-role="date"]')?.textContent).toContain('DOCUMENTS.UPLOADED_AT');
    expect(statuses()).toEqual(['COMPLETED', 'ERROR']);
  });

  it('polls while a CV is under analysis, then stops', async () => {
    await answer([cv(1, 'PENDING')]);
    expect(statuses()).toEqual(['PENDING']);

    vi.advanceTimersByTime(POLLING_INTERVAL_MS);
    await answer([cv(1, 'COMPLETED')]);
    expect(statuses()).toEqual(['COMPLETED']);

    vi.advanceTimersByTime(POLLING_INTERVAL_MS * 3);
    http.expectNone(url);
  });

  it('says when there is no CV', async () => {
    await answer([]);
    expect(element.querySelector('[data-role="empty"]')?.textContent).toContain('DOCUMENTS.EMPTY');
  });

  it('reloads the list after an upload', async () => {
    await answer([]);
    fixture.debugElement.query(By.directive(DocumentUpload)).componentInstance.uploaded.emit([]);
    TestBed.tick();
    await answer([cv(1, 'COMPLETED')]);
    expect(statuses()).toEqual(['COMPLETED']);
  });
});
