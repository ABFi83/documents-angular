import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { Experience } from '@interfaces/experience.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { ExperienceDialog } from './experience-dialog/experience-dialog';
import { Experiences } from './experiences';

describe('Experiences', () => {
  let fixture: ComponentFixture<Experiences>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const url = `${environment.apiBaseUrl}/users/experience`;

  const experience = (id: number, company: string, endDate: string, isCurrent = false): Experience => ({
    id,
    company_name: company,
    role: 'Dev',
    description: '',
    start_date: '2015-01-01',
    end_date: endDate,
    is_current: isCurrent
  });

  const companies = (): string[] =>
    [...element.querySelectorAll('button[data-role="view"]')].map(item => item.textContent?.trim().split(' - ')[0] ?? '');

  const dialog = () => fixture.debugElement.query(By.directive(ExperienceDialog))?.componentInstance as ExperienceDialog | undefined;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Experiences);
    fixture.componentRef.setInput('experiences', [
      experience(1, 'Old', '2018-01-01'),
      experience(2, 'Recent', '2022-01-01'),
      experience(3, 'Current', 'Present', true)
    ]);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('lists the current position first, then the most recent', () => {
    expect(companies()).toEqual(['Current', 'Recent', 'Old']);
  });

  it('opens the dialog read-only from the row and editable from edit', async () => {
    (element.querySelector('button[data-role="view"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(dialog()?.viewing()).toBe(true);
    expect(dialog()?.experience()?.company_name).toBe('Current');

    dialog()?.cancelled.emit();
    await fixture.whenStable();
    expect(dialog()).toBeUndefined();

    (element.querySelector('li div button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(dialog()?.viewing()).toBe(false);
  });

  it('saves from the dialog, then shows the list from the BE', async () => {
    (element.querySelector('button[data-role="add"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    const added = experience(0, 'New', '2024-01-01');
    dialog()?.confirmed.emit(added);
    await fixture.whenStable();

    const save = http.expectOne(req => req.method === 'POST' && req.url === url);
    expect(save.request.body).toEqual({ experience: added });
    save.flush({});
    http
      .expectOne(req => req.method === 'GET' && req.url === url)
      .flush([experience(4, 'New', '2024-01-01'), experience(1, 'Old', '2018-01-01')]);
    await fixture.whenStable();

    expect(companies()).toEqual(['New', 'Old']);
  });

  it('removes an experience once the BE has deleted it', async () => {
    (element.querySelectorAll('li div button')[1] as HTMLButtonElement).click();
    http.expectOne(`${url}/3`).flush({});
    await fixture.whenStable();
    expect(companies()).toEqual(['Recent', 'Old']);
  });
});
