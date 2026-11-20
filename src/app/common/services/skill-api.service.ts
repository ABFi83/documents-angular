import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { Skill } from '@interfaces/skill.interface';
import { Observable } from 'rxjs';

@Service()
export class SkillApiService {
  #http = inject(HttpClient);
  readonly #url = `${environment.apiBaseUrl}/users/skill`;

  // Replaces the user's whole skill list.
  save(skills: Skill[]): Observable<unknown> {
    return this.#http.post(this.#url, { skills });
  }

  delete(id: number): Observable<unknown> {
    return this.#http.delete(`${this.#url}/${id}`);
  }
}
