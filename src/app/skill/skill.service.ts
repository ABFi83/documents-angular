import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { log } from 'console';
import { switchMap } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { Skill, User } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private skillUrl = `${environment.apiBaseUrl}/users/skill`;


  constructor(private http: HttpClient) {}

  getSkill(): Observable<Skill> {
    return this.http.get<Skill>(this.skillUrl).pipe(
      switchMap((skillData) => {
        return [skillData];
      })
    );
  }

  postSkill(skills:Skill[]): Observable<Skill> {
    return this.http.post<Skill>(this.skillUrl, {"skills": skills}).pipe(
      switchMap((skillData) => {
        return [skillData];
      })
    );
  }

  deleteSkill(skill: Skill): Observable<Skill> {
    const url = `${this.skillUrl}/${skill.id}`; // Aggiunge l'ID della skill all'URL
    return this.http.delete<Skill>(url).pipe(
      switchMap((skillData) => {
        return [skillData];
      })
    );
  }
}
