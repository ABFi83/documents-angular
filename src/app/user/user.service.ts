import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { log } from 'console';
import { switchMap } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { User } from '../../model/model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userUrl = `${environment.apiBaseUrl}/users`;
  private userSignal = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    return this.http.get<User>(this.userUrl).pipe(
      switchMap((userData) => {
        this.userSignal.set(userData);
        return [userData];
      })
    );
  }

  getUserSignal() {
    return this.userSignal;
  }

  logout() {
    this.userSignal.set(null);
  }

  reset(): Observable<any> {
    return this.http.post(this.userUrl+'/reset', {});
  }
}
