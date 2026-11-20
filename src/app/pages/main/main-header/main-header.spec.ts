import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SessionService } from '@common/services/session.service';
import { environment } from '@environments/environment';
import { User } from '@interfaces/user.interface';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { MainHeader } from './main-header';

describe('MainHeader', () => {
  let fixture: ComponentFixture<MainHeader>;
  let http: HttpTestingController;
  let element: HTMLElement;

  const button = (label: string): HTMLButtonElement =>
    [...element.querySelectorAll('button')].find(item => item.textContent?.includes(label)) as HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MainHeader);
    fixture.componentRef.setInput('user', { name: 'Mario', surname: 'Rossi' } as User);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('greets the user in the menu', () => {
    expect(element.querySelector('[data-role="user-name"]')?.textContent?.trim()).toBe('Mario Rossi');
    expect(element.querySelector('button[popovertarget="main-menu"]')).not.toBeNull();
  });

  it('closes the menu and tells the parent after a reset', () => {
    const resets = vi.fn();
    fixture.componentInstance.profileReset.subscribe(resets);
    const hide = vi.spyOn(element.querySelector('[popover]') as HTMLElement, 'hidePopover');

    button('MAIN.HEADER.RESET').click();
    const req = http.expectOne(`${environment.apiBaseUrl}/users/reset`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(hide).toHaveBeenCalled();
    expect(resets).toHaveBeenCalledOnce();
  });

  it('alerts when the reset fails', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    button('MAIN.HEADER.RESET').click();
    http.expectOne(`${environment.apiBaseUrl}/users/reset`).flush(null, { status: 400, statusText: 'Bad Request' });

    expect(alert).toHaveBeenCalledWith('MAIN.HEADER.RESET_ERROR');
  });

  it('logs out to the login page', () => {
    const session = TestBed.inject(SessionService);
    session.setToken('jwt');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    button('MAIN.HEADER.LOGOUT').click();

    expect(session.token()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
