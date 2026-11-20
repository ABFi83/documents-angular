import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { Registration } from './registration';

describe('Registration', () => {
  let fixture: ComponentFixture<Registration>;
  let http: HttpTestingController;
  let element: HTMLElement;

  const fill = (values: Record<string, string>): void => {
    for (const [id, value] of Object.entries(values)) {
      const input = element.querySelector(`#${id}`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  };

  const submit = async (): Promise<void> => {
    (element.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  const alertText = (): string | undefined => element.querySelector('[role="alert"]')?.textContent?.trim();

  const valid = { email: 'mario@example.com', confirmEmail: 'mario@example.com', password: 'Secret1!', confirmPassword: 'Secret1!' };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Registration);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('shows one error at a time, in field order', async () => {
    await submit();
    expect(alertText()).toBe('REGISTRATION.ERRORS.INVALID_EMAIL');

    fill({ email: valid.email, confirmEmail: 'other@example.com' });
    await submit();
    expect(alertText()).toBe('REGISTRATION.ERRORS.EMAIL_MISMATCH');

    fill({ confirmEmail: valid.email, password: 'weak' });
    await submit();
    expect(alertText()).toBe('REGISTRATION.ERRORS.WEAK_PASSWORD');

    fill({ password: valid.password, confirmPassword: 'Other1!x' });
    await submit();
    expect(alertText()).toBe('REGISTRATION.ERRORS.PASSWORD_MISMATCH');
  });

  it('registers the email as username and opens the login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fill(valid);
    await submit();

    const req = http.expectOne(`${environment.apiBaseUrl}/auth/register`);
    expect(req.request.body).toEqual({ username: valid.email, password: valid.password });
    req.flush({});
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(alertText()).toBeUndefined();
  });

  it('tells when the email is already registered', async () => {
    fill(valid);
    await submit();
    http.expectOne(`${environment.apiBaseUrl}/auth/register`).flush(null, { status: 400, statusText: 'Bad Request' });
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(alertText()).toBe('REGISTRATION.ERRORS.EMAIL_TAKEN');
  });
});
