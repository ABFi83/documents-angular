import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('renders the header above the page and loads the user once', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/users`).flush({ name: 'Mario', surname: 'Rossi' });
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.firstElementChild?.tagName).toBe('APP-HEADER');
    expect(element.querySelector('router-outlet')).not.toBeNull();
    http.verify();
  });
});
