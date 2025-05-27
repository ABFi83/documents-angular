import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environment';
import { Skill } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private skillUrl = `${environment.apiBaseUrl}/users/skill`;
  private skillsSignal = signal<Skill[]>([]);

  constructor(private http: HttpClient) {}

  getSkill(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.skillUrl).pipe(
      tap((skills) => this.skillsSignal.set(skills))
    );
  }

  postSkill(skills: Skill[]): Observable<any> {
    return this.http.post<any>(this.skillUrl, { skills }).pipe(
      tap(() => {
        this.getSkill().subscribe();
      })
    );
  }

  deleteSkill(skill: Skill): Observable<any> {
    const url = `${this.skillUrl}/${skill.id}`;
    return this.http.delete<any>(url).pipe(
      tap(() => {
        this.getSkill().subscribe();
      })
    );
  }

  getSkillsSignal() {
    return this.skillsSignal;
  }
}
