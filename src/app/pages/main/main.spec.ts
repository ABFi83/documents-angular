import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { DocumentUpload } from '@common/components/document-upload/document-upload';
import { CurrentUserService } from '@common/services/current-user.service';
import { environment } from '@environments/environment';
import { User } from '@interfaces/user.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { Main } from './main';

describe('Main', () => {
  let fixture: ComponentFixture<Main>;
  let http: HttpTestingController;
  const usersUrl = `${environment.apiBaseUrl}/users`;
  const documentsUrl = `${environment.apiBaseUrl}/documents`;
  const user: User = {
    id: 1,
    name: 'Mario',
    surname: 'Rossi',
    username: 'mario@example.com',
    skill: [{ id: 5, name: 'Angular' }],
    experience: [],
    documents: [{ id: 1, title: 'cv.pdf', meta_data: '', file_path: '', version: 1, created_at: '2026-01-01T10:00:00' }]
  };

  // The user resource keeps the app unstable until its request is answered: render, then flush. The summary (if shown)
  // loads after the user: its requests are answered empty, its content is covered by its own spec.
  const load = async (value: User): Promise<void> => {
    fixture.detectChanges();
    http.expectOne(usersUrl).flush(value);
    await new Promise(resolve => setTimeout(resolve));
    TestBed.tick();
    http
      .match(request => request.url.startsWith(documentsUrl))
      .forEach(request =>
        request.flush(request.request.url.endsWith('/summary') ? { documenti: 0, linguaggi: [], frameworks: [], esperienze: [] } : [])
      );
    await fixture.whenStable();
  };

  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), CurrentUserService]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Main);
  });

  afterEach(() => http.verify());

  it('shows the upload while the user has no document', async () => {
    await load({ ...user, documents: [] });
    expect(element().querySelector('app-document-upload')).not.toBeNull();
    expect(element().querySelector('app-cv-summary')).toBeNull();
  });

  it('shows the CV summary and the profile added by hand once the user has a document', async () => {
    await load(user);
    expect(element().querySelector('app-document-upload')).toBeNull();
    expect(element().querySelector('app-cv-summary')).not.toBeNull();
    expect(element().querySelector('app-skills')?.textContent).toContain('Angular');
  });

  it('opens the CV list after an upload', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await load({ ...user, documents: [] });

    fixture.debugElement.query(By.directive(DocumentUpload)).componentInstance.uploaded.emit([]);

    expect(navigate).toHaveBeenCalledWith(['/documents']);
  });

  it('goes back to the upload when the reloaded user has no document', async () => {
    await load(user);
    TestBed.inject(CurrentUserService).reload();
    await load({ ...user, documents: [] });
    expect(element().querySelector('app-document-upload')).not.toBeNull();
  });
});
