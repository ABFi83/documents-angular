import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { Experience } from './../model/model';
import id from '@angular/common/locales/id';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {

  private experienceUrl = `${environment.apiBaseUrl}/users/experience`;

  constructor(private http: HttpClient) {}

  getExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.experienceUrl);
  }

  manageExperience(experience: Experience): Observable<Experience> {
    return this.http.post<Experience>(this.experienceUrl, {"experience":experience});
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.experienceUrl}/${id}`);
  }
}
