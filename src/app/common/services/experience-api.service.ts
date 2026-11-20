import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { Experience } from '@interfaces/experience.interface';
import { Observable } from 'rxjs';

@Service()
export class ExperienceApiService {
  #http = inject(HttpClient);
  readonly #url = `${environment.apiBaseUrl}/users/experience`;

  list(): Observable<Experience[]> {
    return this.#http.get<Experience[]>(this.#url);
  }

  // Creates the experience when its id is 0, updates it otherwise.
  save(experience: Experience): Observable<Experience> {
    return this.#http.post<Experience>(this.#url, { experience });
  }

  delete(id: number): Observable<unknown> {
    return this.#http.delete(`${this.#url}/${id}`);
  }
}
