import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('title', 'Delete?');
    fixture.componentRef.setInput('message', 'cv.pdf will be lost.');
    fixture.componentRef.setInput('confirmLabel', 'Delete');
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('opens as a modal with title, message and actions', () => {
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(element.querySelector('h2')?.textContent).toBe('Delete?');
    expect(element.querySelector('p')?.textContent).toBe('cv.pdf will be lost.');
    expect(element.querySelector('[data-role="confirm"]')?.textContent?.trim()).toBe('Delete');
  });

  it('emits the choice', () => {
    const confirmed = vi.fn();
    const cancelled = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    fixture.componentInstance.cancelled.subscribe(cancelled);

    (element.querySelector('[data-role="confirm"]') as HTMLButtonElement).click();
    (element.querySelector('footer button') as HTMLButtonElement).click();

    expect(confirmed).toHaveBeenCalledOnce();
    expect(cancelled).toHaveBeenCalledOnce();
  });
});
