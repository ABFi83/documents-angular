import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SessionService } from '@common/services/session.service';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let http: HttpTestingController;
  let element: HTMLElement;

  const type = (selector: string, value: string): void => {
    const input = element.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const submit = async (response: object, status = 200): Promise<void> => {
    (element.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    const req = http.expectOne(`${environment.apiBaseUrl}/auth/login`);
    req.flush(response, { status, statusText: status === 200 ? 'OK' : 'Error' });
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Login);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('stores the token and opens the main page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    type('#username', 'mario');
    type('#password', 'secret');

    (element.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    const req = http.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.body).toEqual({ username: 'mario', password: 'secret' });
    req.flush({ access_token: 'jwt' });
    await fixture.whenStable();

    expect(TestBed.inject(SessionService).token()).toBe('jwt');
    expect(navigate).toHaveBeenCalledWith(['/main']);
  });

  it('shows invalid credentials when no token comes back', async () => {
    await submit({});
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('LOGIN.ERRORS.INVALID_CREDENTIALS');
  });

  it('shows the login error when the request fails', async () => {
    await submit({}, 401);
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('LOGIN.ERRORS.GENERIC');
  });

  it('links to the registration', () => {
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/registration');
  });
});
