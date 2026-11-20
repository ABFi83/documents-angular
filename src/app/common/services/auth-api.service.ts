import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { Credentials, LoginResponse } from '@interfaces/auth.interface';
import { Observable } from 'rxjs';

@Service()
export class AuthApiService {
  #http = inject(HttpClient);
  readonly #url = `${environment.apiBaseUrl}/auth`;

  login(credentials: Credentials): Observable<LoginResponse> {
    return this.#http.post<LoginResponse>(`${this.#url}/login`, credentials);
  }

  register(credentials: Credentials): Observable<unknown> {
    return this.#http.post(`${this.#url}/register`, credentials);
  }
}
