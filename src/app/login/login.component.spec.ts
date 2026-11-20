import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent (zoneless)', () => {
  it('renders the error message after a failed login request', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();

    const done = fixture.componentInstance.login();
    TestBed.inject(HttpTestingController).expectOne(() => true).flush(null, { status: 500, statusText: 'err' });
    await done;
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.error-message')?.textContent).toContain('Errore di login');
  });
});
