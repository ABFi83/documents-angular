import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(SessionService);
  });

  it('stores, reads and clears the token', () => {
    expect(service.isLoggedIn()).toBe(false);

    service.setToken('jwt');
    expect(localStorage.getItem(environment.tokenKey)).toBe('jwt');
    expect(service.token()).toBe('jwt');
    expect(service.isLoggedIn()).toBe(true);

    service.clear();
    expect(service.token()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
