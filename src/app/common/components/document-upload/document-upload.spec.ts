import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { DocumentUpload } from './document-upload';

describe('DocumentUpload', () => {
  let fixture: ComponentFixture<DocumentUpload>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const url = `${environment.apiBaseUrl}/documents`;
  const pdf = (name: string): File => new File(['%PDF'], name, { type: 'application/pdf' });

  const select = async (...files: File[]): Promise<void> => {
    const input = element.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  const click = async (role: string): Promise<void> => {
    (element.querySelector(`button[data-role="${role}"]`) as HTMLButtonElement).click();
    await fixture.whenStable();
  };

  const names = (): string[] => [...element.querySelectorAll('li span')].map(item => item.textContent?.trim() ?? '');
  const alertText = (): string | undefined => element.querySelector('[role="alert"]')?.textContent?.trim();

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DocumentUpload);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('accepts several PDFs only', () => {
    const input = element.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
    expect(input.accept).toBe('application/pdf');
  });

  it('adds the picked files to the list, without duplicates', async () => {
    await select(pdf('a.pdf'), pdf('b.pdf'));
    await select(pdf('b.pdf'), pdf('c.pdf'));
    expect(names()).toEqual(['a.pdf', 'b.pdf', 'c.pdf']);
  });

  it('refuses to upload while a file is not a PDF', async () => {
    await select(pdf('a.pdf'), new File(['x'], 'cv.docx'));
    expect(alertText()).toContain('UPLOAD.ERRORS.NOT_PDF');
    expect(element.querySelector('button[data-role="proceed"]')).toBeNull();

    (element.querySelectorAll('li button')[1] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(names()).toEqual(['a.pdf']);
    expect(element.querySelector('button[data-role="proceed"]')).not.toBeNull();
  });

  it('uploads all the files and hands the processes to the parent', async () => {
    const uploaded = vi.fn();
    fixture.componentInstance.uploaded.subscribe(uploaded);
    await select(pdf('a.pdf'), pdf('b.pdf'));

    await click('proceed');
    const req = http.expectOne(url);
    expect((req.request.body as FormData).getAll('files')).toHaveLength(2);
    expect(element.querySelector('[role="progressbar"]')).not.toBeNull();
    req.flush([{ id: 1 }, { id: 2 }]);
    await fixture.whenStable();

    expect(uploaded).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    expect(names()).toEqual([]);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('UPLOAD.SUCCESS');
  });

  it('names the files the BE rejects', async () => {
    await select(pdf('a.pdf'));
    await click('proceed');
    http.expectOne(url).flush({ msg: 'Sono accettati solo PDF', files: ['a.pdf'] }, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();

    expect(alertText()).toContain('UPLOAD.ERRORS.REJECTED_FILES');
    expect(names()).toEqual(['a.pdf']);
  });

  it('tells when the BE received no file', async () => {
    await select(pdf('a.pdf'));
    await click('proceed');
    http.expectOne(url).flush({ msg: 'Nessun file caricato' }, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();

    expect(alertText()).toContain('UPLOAD.ERRORS.NO_FILES');
  });

  it('asks to retry on any other failure', async () => {
    await select(pdf('a.pdf'));
    await click('proceed');
    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(alertText()).toContain('UPLOAD.ERRORS.UPLOAD_FAILED');
  });

  it('takes dropped files too', async () => {
    const drop = Object.assign(new Event('drop'), { dataTransfer: { files: [pdf('a.pdf'), pdf('b.pdf')] } });
    element.querySelector('section')?.dispatchEvent(drop);
    await fixture.whenStable();
    expect(names()).toEqual(['a.pdf', 'b.pdf']);
  });

  it('clears the list', async () => {
    await select(pdf('a.pdf'));
    await click('clear');
    expect(names()).toEqual([]);
    expect(element.querySelector('footer')).toBeNull();
  });
});
