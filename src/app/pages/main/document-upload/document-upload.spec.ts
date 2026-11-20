import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { Process } from '@interfaces/document.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { DocumentUpload } from './document-upload';

describe('DocumentUpload', () => {
  let fixture: ComponentFixture<DocumentUpload>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const pdf = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' });

  const select = async (file: File): Promise<void> => {
    const input = element.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  const proceed = async (): Promise<void> => {
    (element.querySelector('button[data-role="proceed"]') as HTMLButtonElement).click();
    await fixture.whenStable();
  };

  const poll = async (process: Partial<Process>): Promise<void> => {
    vi.advanceTimersByTime(5000);
    http.expectOne(`${environment.apiBaseUrl}/process/7`).flush(process);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    // Only the polling interval: faking every timer would also stop Angular's change detection scheduler.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DocumentUpload);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('refuses a file that is not a PDF', async () => {
    await select(new File(['x'], 'cv.docx'));
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('UPLOAD.ERRORS.NOT_PDF');
    expect(element.querySelector('button[data-role="proceed"]')).toBeNull();
  });

  it('uploads the PDF and polls until the document is parsed', async () => {
    const completed = vi.fn();
    fixture.componentInstance.uploadCompleted.subscribe(completed);
    await select(pdf);
    expect(element.querySelector('label')?.textContent).toContain('cv.pdf');

    await proceed();
    http.expectOne(`${environment.apiBaseUrl}/documents`).flush({ id: 7 });
    expect(element.querySelector('[role="progressbar"]')).not.toBeNull();

    await poll({ status: 'IN_PROGRESS' });
    expect(completed).not.toHaveBeenCalled();
    await poll({ status: 'COMPLETED' });

    expect(completed).toHaveBeenCalledOnce();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('UPLOAD.SUCCESS');
  });

  it('shows the BE message when parsing fails', async () => {
    await select(pdf);
    await proceed();
    http.expectOne(`${environment.apiBaseUrl}/documents`).flush({ id: 7 });
    await poll({ status: 'ERROR', error_message: 'Unreadable PDF' });

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Unreadable PDF');
    expect(element.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('asks to retry when the upload fails', async () => {
    await select(pdf);
    await proceed();
    http.expectOne(`${environment.apiBaseUrl}/documents`).flush(null, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('UPLOAD.ERRORS.UPLOAD_FAILED');
  });

  it('uploads a dropped file too', async () => {
    const drop = Object.assign(new Event('drop'), { dataTransfer: { files: [pdf] } });
    element.querySelector('section')?.dispatchEvent(drop);
    await fixture.whenStable();
    await proceed();

    const body = http.expectOne(`${environment.apiBaseUrl}/documents`).request.body as FormData;
    expect((body.get('file') as File).name).toBe('cv.pdf');
  });

  it('clears the selected file', async () => {
    await select(pdf);
    (element.querySelector('button[data-role="clear"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(element.querySelector('label')?.textContent).toContain('UPLOAD.CHOOSE_FILE');
  });
});
