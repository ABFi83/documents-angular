import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SessionService } from '@common/services/session.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const run = () => TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('lets a logged-in user through', () => {
    TestBed.inject(SessionService).setToken('jwt');
    expect(run()).toBe(true);
  });

  it('redirects to the login without a session', () => {
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login');
  });
});
