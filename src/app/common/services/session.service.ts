import { Service } from '@angular/core';
import { environment } from '@environments/environment';

/** The JWT of the logged-in user, kept in localStorage. */
@Service()
export class SessionService {
  token(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  clear(): void {
    localStorage.removeItem(environment.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.token() !== null;
  }
}
