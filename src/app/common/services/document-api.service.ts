import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { Process, UploadResponse } from '@interfaces/document.interface';
import { Observable } from 'rxjs';

@Service()
export class DocumentApiService {
  #http = inject(HttpClient);

  upload(title: string, metadata: string, file: File): Observable<UploadResponse> {
    const body = new FormData();
    body.append('title', title);
    body.append('metadata', metadata);
    body.append('file', file);
    return this.#http.post<UploadResponse>(`${environment.apiBaseUrl}/documents`, body);
  }

  process(id: number): Observable<Process> {
    return this.#http.get<Process>(`${environment.apiBaseUrl}/process/${id}`);
  }
}
