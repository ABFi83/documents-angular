import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';


@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentUrl = `${environment.apiBaseUrl}/documents`;


  constructor(private http: HttpClient) {}

  uploadDocument(title: string, metadata: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('metadata', metadata);
    formData.append('file', file);

    console.log('Uploading document with title, metadata, and file:', title, metadata, file);
    return this.http.post(this.documentUrl, formData);
  }


}
