import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CurrentUserService } from '@common/services/current-user.service';
import { SessionService } from '@common/services/session.service';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  let http: HttpTestingController;
  let element: HTMLElement;

  const button = (label: string): HTMLButtonElement =>
    [...element.querySelectorAll('button')].find(item => item.textContent?.includes(label)) as HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), CurrentUserService]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppHeader);
    element = fixture.nativeElement;
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/users`).flush({ name: 'Mario', surname: 'Rossi' });
    await fixture.whenStable();
  });

  it('greets the user in the menu', () => {
    expect(element.querySelector('[data-role="user-name"]')?.textContent?.trim()).toBe('Mario Rossi');
    expect(element.querySelector('button[popovertarget="main-menu"]')).not.toBeNull();
  });

  it('links the profile and the CV list', () => {
    const links = [...element.querySelectorAll('nav a')].map(link => link.getAttribute('href'));
    expect(links).toEqual(['/main', '/documents']);
  });

  it('closes the menu, reloads the user and goes to the profile after a reset', async () => {
    const hide = vi.spyOn(element.querySelector('[popover]') as HTMLElement, 'hidePopover');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    button('MAIN.HEADER.RESET').click();
    const req = http.expectOne(`${environment.apiBaseUrl}/users/reset`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    TestBed.tick();

    expect(hide).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/main']);
    http.expectOne(`${environment.apiBaseUrl}/users`).flush({ name: 'Mario', surname: 'Rossi' });
    await fixture.whenStable();
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
