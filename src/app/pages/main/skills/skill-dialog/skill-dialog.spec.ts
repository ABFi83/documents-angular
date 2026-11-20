import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { SkillDialog } from './skill-dialog';

describe('SkillDialog', () => {
  let fixture: ComponentFixture<SkillDialog>;
  let element: HTMLElement;

  const added = (): string[] => [...element.querySelectorAll('li')].map(item => item.firstChild?.textContent?.trim() ?? '');
  const confirmButton = (): HTMLButtonElement => element.querySelectorAll('footer button')[1] as HTMLButtonElement;

  const typeAndPick = async (value: string): Promise<void> => {
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    fixture = TestBed.createComponent(SkillDialog);
    fixture.componentRef.setInput('skills', [{ id: 2, name: 'Java' }]);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('opens as a modal with the current skills', () => {
    expect((element.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(added()).toEqual(['Java']);
  });

  it('adds only catalog skills, once, and drops them from the suggestions', async () => {
    await typeAndPick('Cobol');
    await typeAndPick('Java');
    await typeAndPick('Python');

    expect(added()).toEqual(['Java', 'Python']);
    expect((element.querySelector('input') as HTMLInputElement).value).toBe('');
    const suggestions = [...element.querySelectorAll('option')].map(option => option.value);
    expect(suggestions).not.toContain('Python');
  });

  it('confirms the added skills and disables confirm when none is left', async () => {
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    confirmButton().click();
    expect(confirmed).toHaveBeenCalledWith([{ id: 2, name: 'Java' }]);

    (element.querySelector('li button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(added()).toEqual([]);
    expect(confirmButton().disabled).toBe(true);
  });

  it('cancels from the button and from Escape (dialog close)', () => {
    const cancelled = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);

    (element.querySelector('footer button') as HTMLButtonElement).click();
    element.querySelector('dialog')?.dispatchEvent(new Event('close'));

    expect(cancelled).toHaveBeenCalledTimes(2);
  });
});
