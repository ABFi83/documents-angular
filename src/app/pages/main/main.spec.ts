import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { environment } from '@environments/environment';
import { User } from '@interfaces/user.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { DocumentUpload } from './document-upload/document-upload';
import { Main } from './main';
import { MainHeader } from './main-header/main-header';

describe('Main', () => {
  let fixture: ComponentFixture<Main>;
  let http: HttpTestingController;
  const usersUrl = `${environment.apiBaseUrl}/users`;
  const user: User = {
    id: 1,
    name: 'Mario',
    surname: 'Rossi',
    username: 'mario@example.com',
    skill: [{ id: 5, name: 'Angular' }],
    experience: [],
    documents: [{ id: 1, title: 'cv.pdf', metaData: '', filePath: '', version: 1, createdAt: '2026-01-01' }]
  };

  // The user resource keeps the app unstable until its request is answered: render, then flush.
  const loadUser = async (value: User): Promise<void> => {
    fixture.detectChanges();
    http.expectOne(usersUrl).flush(value);
    await fixture.whenStable();
  };

  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Main);
    fixture.detectChanges();
  });

  it('shows the upload while the user has no document', async () => {
    expect(element().querySelector('app-document-upload')).not.toBeNull();
    await loadUser({ ...user, documents: [] });
    expect(element().querySelector('app-document-upload')).not.toBeNull();
  });

  it('shows the profile once the user has a document', async () => {
    await loadUser(user);
    expect(element().querySelector('app-document-upload')).toBeNull();
    expect(element().querySelector('app-skills')?.textContent).toContain('Angular');
  });

  it('reloads the user and shows the profile after an upload', async () => {
    await loadUser({ ...user, documents: [] });
    fixture.debugElement.query(By.directive(DocumentUpload)).componentInstance.uploadCompleted.emit();
    await loadUser(user);
    expect(element().querySelector('app-skills')).not.toBeNull();
  });

  it('goes back to the upload after a profile reset', async () => {
    await loadUser(user);
    fixture.debugElement.query(By.directive(MainHeader)).componentInstance.profileReset.emit();
    await fixture.whenStable();
    expect(element().querySelector('app-document-upload')).not.toBeNull();
  });
});
