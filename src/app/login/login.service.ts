import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = `${environment.apiBaseUrl}/auth/login`;


  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginData = { username, password };
    return this.http.post<any>(this.loginUrl, loginData);
  }

  setToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(environment.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
  logout(): void {
    this.clearToken();
  }
}
