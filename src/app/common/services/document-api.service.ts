import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@environments/environment';
import { CvDocument, CvSummary, Process } from '@interfaces/document.interface';
import { Observable } from 'rxjs';

@Service()
export class DocumentApiService {
  #http = inject(HttpClient);
  readonly #url = `${environment.apiBaseUrl}/documents`;

  // One analysis process per CV; the BE titles each document after its file name.
  upload(files: readonly File[]): Observable<Process[]> {
    const body = new FormData();
    files.forEach(file => body.append('files', file));
    body.append('metadata', '');
    return this.#http.post<Process[]>(this.#url, body);
  }

  /** The CV list, newest first, each with its analysis. */
  list(): Observable<CvDocument[]> {
    return this.#http.get<CvDocument[]>(this.#url);
  }

  /** What the analyzed CVs add up to. */
  summary(): Observable<CvSummary> {
    return this.#http.get<CvSummary>(`${this.#url}/summary`);
  }

  get(id: number): Observable<CvDocument> {
    return this.#http.get<CvDocument>(`${this.#url}/${id}`);
  }

  download(id: number): Observable<Blob> {
    return this.#http.get(`${this.#url}/download/${id}`, { responseType: 'blob' });
  }

  /** Deletes the CV, its file and its analysis, even while the analysis is still pending. */
  delete(id: number): Observable<unknown> {
    return this.#http.delete(`${this.#url}/${id}`);
  }
}
