import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Experience } from '@interfaces/experience.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { ExperienceDialog } from './experience-dialog';

describe('ExperienceDialog', () => {
  let fixture: ComponentFixture<ExperienceDialog>;
  let element: HTMLElement;

  const field = (id: string): HTMLInputElement => element.querySelector(`#experience-${id}`) as HTMLInputElement;

  const type = (id: string, value: string): void => {
    field(id).value = value;
    field(id).dispatchEvent(new Event('input'));
  };

  const submit = async (): Promise<void> => {
    (element.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  const create = async (inputs: { experience?: Experience; viewing?: boolean } = {}): Promise<void> => {
    fixture = TestBed.createComponent(ExperienceDialog);
    if (inputs.experience) fixture.componentRef.setInput('experience', inputs.experience);
    if (inputs.viewing) fixture.componentRef.setInput('viewing', true);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  const current: Experience = {
    id: 9,
    company_name: 'ACME',
    role: 'Dev',
    description: 'Angular',
    start_date: '2020-01-01',
    end_date: 'Present',
    is_current: true
  };

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTranslateService()] }));

  it('marks the missing required fields on confirm', async () => {
    await create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    await submit();

    expect(confirmed).not.toHaveBeenCalled();
    for (const id of ['company', 'role', 'start', 'end']) expect(field(id).dataset['error']).toBe('true');
  });

  it('confirms a new experience with id 0', async () => {
    await create();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    type('company', 'ACME');
    type('role', 'Dev');
    type('start', '2020-01-01');
    type('end', '2021-01-01');

    await submit();

    expect(confirmed).toHaveBeenCalledWith({
      id: 0,
      company_name: 'ACME',
      role: 'Dev',
      description: '',
      start_date: '2020-01-01',
      end_date: '2021-01-01',
      is_current: false
    });
  });

  it('edits the current position: no end date, sent as Present', async () => {
    await create({ experience: current });
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    expect(field('company').value).toBe('ACME');
    expect(field('end').disabled).toBe(true);

    await submit();

    expect(confirmed).toHaveBeenCalledWith(current);
  });

  it('shows an experience read-only', async () => {
    await create({ experience: current, viewing: true });
    expect(field('company').disabled).toBe(true);
    expect(field('current').disabled).toBe(true);
    expect((element.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
  });
});
