import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
import { Process } from '../../model/model';

@Injectable({
  providedIn: 'root'
})
export class ProcesService {
  private documentUrl = `${environment.apiBaseUrl}/process`;


  constructor(private http: HttpClient) {}

  getProcess(id: number): Observable<Process> {
    return this.http.get<Process>(`${this.documentUrl}/${id}`);
  }
}
