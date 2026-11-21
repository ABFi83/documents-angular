import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CurrentUserService } from '@common/services/current-user.service';
import { environment } from '@environments/environment';
import { CvSummary as Summary } from '@interfaces/document.interface';
import { User } from '@interfaces/user.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { CvSummary } from './cv-summary';

describe('CvSummary', () => {
  let fixture: ComponentFixture<CvSummary>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const url = `${environment.apiBaseUrl}/documents`;
  const summary: Summary = {
    documenti: 2,
    linguaggi: [
      { nome: 'Python', document_ids: [3, 2] },
      { nome: 'Java', document_ids: [2] }
    ],
    frameworks: [],
    esperienze: [
      { azienda: 'ACME', ruolo: 'Developer', start_date: '2020-09-01', end_date: null, description: 'Frontend', document_ids: [3, 2] },
      { azienda: 'Beta', ruolo: 'Intern', start_date: null, end_date: null, description: null, document_ids: [9] }
    ]
  };

  const answer = async (value: Summary): Promise<void> => {
    TestBed.tick();
    http.expectOne(`${url}/summary`).flush(value);
    http.expectOne(url).flush([
      { id: 3, title: 'cv-3.pdf' },
      { id: 2, title: 'cv-2.pdf' }
    ]);
    await fixture.whenStable();
  };

  const text = (selector: string): string[] =>
    [...element.querySelectorAll(selector)].map(item => item.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  const hrefs = (selector: string): (string | null)[] => [...element.querySelectorAll(selector)].map(link => link.getAttribute('href'));

  beforeEach(() => {
    document.documentElement.lang = 'it';
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: CurrentUserService, useValue: { user: signal({ id: 1 } as User) } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CvSummary);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows the chips with the number of CVs, opening the source CV or the list of them', async () => {
    await answer(summary);

    expect(text('ul[data-role="chips"] li')).toEqual(['Python SUMMARY.IN_CVS', 'Java SUMMARY.IN_CVS']);
    // Found in one CV: a link to it. Found in more: a button with a popover listing them by title.
    expect(hrefs('ul[data-role="chips"] a')).toEqual(['/documents/2']);
    const button = element.querySelector('ul[data-role="chips"] button') as HTMLButtonElement;
    const popover = element.querySelector(`#${button.getAttribute('popovertarget')}`) as HTMLElement;
    expect(popover.hasAttribute('popover')).toBe(true);
    expect(text(`#${popover.id} a`)).toEqual(['descriptioncv-3.pdf', 'descriptioncv-2.pdf']);
    expect(hrefs(`#${popover.id} a`)).toEqual(['/documents/3', '/documents/2']);
    expect(text('[data-role="none"]')).toEqual(['DOCUMENTS.NONE']);
  });

  it('shows the experiences as a timeline with links to their CVs', async () => {
    await answer(summary);

    expect(text('ol h4')).toEqual(['Developer', 'Intern']);
    expect(text('[data-role="period"]')).toEqual(['set 2020 – DOCUMENTS.PRESENT']);
    expect(text('[data-role="description"]')).toEqual(['Frontend']);
    // The CV list has no title for id 9 (yet): it is shown by id.
    expect(text('[data-role="sources"] a')).toEqual(['cv-3.pdf', 'cv-2.pdf', '#9']);
    expect(hrefs('[data-role="sources"] a')).toEqual(['/documents/3', '/documents/2', '/documents/9']);
  });

  it('says when no CV has been analyzed yet', async () => {
    await answer({ documenti: 0, linguaggi: [], frameworks: [], esperienze: [] });
    expect(text('[data-role="none"]')).toEqual(['SUMMARY.EMPTY']);
    expect(element.querySelector('[data-role="columns"]')).toBeNull();
  });
});
