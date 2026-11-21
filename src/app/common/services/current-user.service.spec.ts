import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { User } from '@interfaces/user.interface';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  let service: CurrentUserService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/users`;

  const answer = async (user: Partial<User>): Promise<void> => {
    TestBed.tick();
    http.expectOne(url).flush(user);
    await TestBed.inject(ApplicationRef).whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), CurrentUserService] });
    service = TestBed.inject(CurrentUserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the user and reloads it on demand', async () => {
    expect(service.user()).toBeNull();
    await answer({ name: 'Mario' });
    expect(service.user()?.name).toBe('Mario');

    service.reload();
    await answer({ name: 'Luigi' });
    expect(service.user()?.name).toBe('Luigi');
  });
});
