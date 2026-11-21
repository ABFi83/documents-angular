import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CurrentUserService } from '@common/services/current-user.service';
import { DocumentUpload } from '@common/components/document-upload/document-upload';
import { environment } from '@environments/environment';
import { CvDocument, ProcessStatus } from '@interfaces/document.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { POLLING_INTERVAL_MS } from '@utils/polling';
import { vi } from 'vitest';
import { DocumentsList } from './documents-list';

describe('DocumentsList', () => {
  let fixture: ComponentFixture<DocumentsList>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const currentUser = { reload: vi.fn() };
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
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: CurrentUserService, useValue: currentUser }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DocumentsList);
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

  it('deletes a CV still under analysis after the confirmation, then reloads list and user', async () => {
    await answer([cv(2, 'COMPLETED'), cv(1, 'PENDING')]);

    (element.querySelectorAll('button[data-role="delete"]')[1] as HTMLButtonElement).click();
    await fixture.whenStable();
    const dialog = element.querySelector('app-confirm-dialog') as HTMLElement;
    expect(dialog.textContent).toContain('DOCUMENTS.DELETE.MESSAGE_PENDING');
    (dialog.querySelector('[data-role="confirm"]') as HTMLButtonElement).click();
    await fixture.whenStable();

    const req = http.expectOne(`${url}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await answer([cv(2, 'COMPLETED')]);

    expect(statuses()).toEqual(['COMPLETED']);
    expect(currentUser.reload).toHaveBeenCalled();
    expect(element.querySelector('app-confirm-dialog')).toBeNull();
  });

  it('keeps the CV when the deletion is cancelled', async () => {
    await answer([cv(1, 'COMPLETED')]);

    (element.querySelector('button[data-role="delete"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    (element.querySelector('app-confirm-dialog footer button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(element.querySelector('app-confirm-dialog')).toBeNull();
    http.expectNone(`${url}/1`);
  });
});
