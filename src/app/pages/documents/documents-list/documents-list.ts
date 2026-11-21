import { Component, computed, DOCUMENT, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DocumentUpload } from '@common/components/document-upload/document-upload';
import { DocumentApiService } from '@common/services/document-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { formatDateTime } from '@utils/date';
import { isAnalyzing, pollWhile } from '@utils/polling';

/** The uploaded CVs, newest first, refreshed while any of them is still under analysis. */
@Component({
  selector: 'app-documents-history',
  imports: [DocumentUpload, RouterLink, TranslatePipe],
  templateUrl: './documents-history.html',
  styleUrl: './documents-history.scss'
})
export class DocumentsHistory {
  #documentApi = inject(DocumentApiService);
  readonly #locale = inject(DOCUMENT).documentElement.lang;

  #documents = rxResource({
    stream: () => pollWhile(this.#documentApi.list(), documents => documents.some(isAnalyzing))
  });

  protected readonly loaded = computed(() => this.#documents.hasValue());
  protected readonly items = computed(() =>
    (this.#documents.hasValue() ? this.#documents.value() : []).map(document => ({
      id: document.id,
      title: document.title,
      uploadedAt: formatDateTime(document.created_at, this.#locale),
      status: document.process?.status ?? 'PENDING'
    }))
  );

  // Restarts the polling, which stops once every CV has been analyzed.
  protected onUploaded(): void {
    this.#documents.reload();
  }
}
