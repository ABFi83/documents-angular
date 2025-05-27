import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environment';
import { Experience } from './../model/model';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private experienceUrl = `${environment.apiBaseUrl}/users/experience`;
  private experiencesSignal = signal<Experience[]>([]);

  constructor(private http: HttpClient) {}

  getExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.experienceUrl).pipe(
      tap((experiences) => this.experiencesSignal.set(experiences))
    );
  }

  manageExperience(experience: Experience): Observable<Experience> {
    return this.http.post<Experience>(this.experienceUrl, { experience }).pipe(
      tap(() => {
        this.getExperiences().subscribe();
      })
    );
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.experienceUrl}/${id}`).pipe(
      tap(() => {
        this.getExperiences().subscribe();
      })
    );
  }

  getExperiencesSignal() {
    return this.experiencesSignal;
  }
}
