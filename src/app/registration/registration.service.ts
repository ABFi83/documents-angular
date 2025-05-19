import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private registrationUrl = `${environment.apiBaseUrl}/auth/register`;


  constructor(private http: HttpClient) {}

  registration(username: string, password: string): Observable<any> {
    const registrationData = { username, password };
    return this.http.post<any>(this.registrationUrl, registrationData);
  }

}
