import { Component, computed, DOCUMENT, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DocumentApiService } from '@common/services/document-api.service';
import { CvDocument } from '@interfaces/document.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { formatDateTime, formatMonth } from '@utils/date';
import { isAnalyzing, pollWhile } from '@utils/polling';

/** One CV of the history: its status and, once analyzed, what the BE extracted from it. */
@Component({
  selector: 'app-documents-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './documents-detail.html',
  styleUrl: './documents-detail.scss'
})
export class DocumentsDetail {
  #documentApi = inject(DocumentApiService);
  #document = inject(DOCUMENT);
  readonly #locale = this.#document.documentElement.lang;

  /** Route parameter `:id`. */
  id = input.required<string>();

  #cv = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => pollWhile(this.#documentApi.get(params), isAnalyzing)
  });

  protected readonly view = computed(() => (this.#cv.hasValue() ? this.#toView(this.#cv.value()) : null));

  // The download needs the auth header, so it goes through HttpClient and a temporary object URL.
  protected download(id: number, title: string): void {
    this.#documentApi.download(id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const link = Object.assign(this.#document.createElement('a'), { href: url, download: title });
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  #toView(cv: CvDocument) {
    const result = cv.process?.result;
    const person = [result?.nome, result?.cognome].filter(Boolean).join(' ');
    return {
      id: cv.id,
      title: cv.title,
      uploadedAt: formatDateTime(cv.created_at, this.#locale),
      status: cv.process?.status ?? 'PENDING',
      errorMessage: cv.process?.error_message ?? null,
      person: person || null,
      languages: result?.linguaggi ?? [],
      frameworks: result?.frameworks ?? [],
      experiences: (result?.esperienze ?? []).map((experience, index) => ({
        index,
        role: experience.ruolo,
        company: experience.azienda,
        start: experience.start_date ? formatMonth(experience.start_date, this.#locale) : null,
        // null = current position ("in corso").
        end: experience.end_date ? formatMonth(experience.end_date, this.#locale) : null,
        description: experience.description
      }))
    };
  }
}
