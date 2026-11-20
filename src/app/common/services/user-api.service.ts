import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { User } from '@interfaces/user.interface';
import { Observable } from 'rxjs';

@Service()
export class UserApiService {
  #http = inject(HttpClient);
  readonly #url = `${environment.apiBaseUrl}/users`;

  get(): Observable<User> {
    return this.#http.get<User>(this.#url);
  }

  // Wipes the user's document and the profile extracted from it.
  reset(): Observable<unknown> {
    return this.#http.post(`${this.#url}/reset`, {});
  }
}
