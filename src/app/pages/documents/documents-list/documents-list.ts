import { Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '@common/components/confirm-dialog/confirm-dialog';
import { DocumentUpload } from '@common/components/document-upload/document-upload';
import { CurrentUserService } from '@common/services/current-user.service';
import { DocumentApiService } from '@common/services/document-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { formatDateTime } from '@utils/date';
import { isAnalyzing, pollWhile } from '@utils/polling';

interface ListItem {
  id: number;
  title: string;
  uploadedAt: string;
  status: string;
  analyzing: boolean;
}

/** The uploaded CVs, newest first, refreshed while any of them is still under analysis. */
@Component({
  selector: 'app-documents-list',
  imports: [ConfirmDialog, DocumentUpload, RouterLink, TranslatePipe],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.scss'
})
export class DocumentsList {
  #documentApi = inject(DocumentApiService);
  #currentUser = inject(CurrentUserService);
  readonly #locale = inject(DOCUMENT).documentElement.lang;

  #documents = rxResource({
    stream: () => pollWhile(this.#documentApi.list(), documents => documents.some(isAnalyzing))
  });

  protected readonly loaded = computed(() => this.#documents.hasValue());
  protected readonly items = computed<ListItem[]>(() =>
    (this.#documents.hasValue() ? this.#documents.value() : []).map(document => ({
      id: document.id,
      title: document.title,
      uploadedAt: formatDateTime(document.created_at, this.#locale),
      status: document.process?.status ?? 'PENDING',
      analyzing: isAnalyzing(document)
    }))
  );
  /** The CV waiting for the delete confirmation. */
  protected readonly toDelete = signal<ListItem | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  // Restarts the polling, which stops once every CV has been analyzed.
  protected onUploaded(): void {
    this.#reload();
  }

  protected askDelete(item: ListItem): void {
    this.toDelete.set(item);
  }

  protected cancelDelete(): void {
    this.toDelete.set(null);
  }

  // A CV still waiting for its analysis can be deleted too.
  protected confirmDelete(): void {
    const item = this.toDelete();
    if (!item) return;
    this.toDelete.set(null);
    this.deletingId.set(item.id);
    this.#documentApi.delete(item.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.#reload();
      },
      error: error => {
        this.deletingId.set(null);
        console.error('Error deleting CV:', error);
      }
    });
  }

  // The profile adds up the CVs and switches to the upload without any: the user is reloaded too.
  #reload(): void {
    this.#documents.reload();
    this.#currentUser.reload();
  }
}
