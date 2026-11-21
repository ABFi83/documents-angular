import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentApiService } from '@common/services/document-api.service';
import { Process } from '@interfaces/document.interface';
import { TranslatePipe } from '@ngx-translate/core';

interface UploadError {
  key: string;
  params?: Record<string, string>;
}

/** Picks one or more PDF CVs and uploads them; the analysis then goes on in the BE (see the CV list). */
@Component({
  selector: 'app-document-upload',
  imports: [TranslatePipe],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.scss'
})
export class DocumentUpload {
  #documentApi = inject(DocumentApiService);
  #destroyRef = inject(DestroyRef);

  /** One analysis process per uploaded CV. */
  uploaded = output<Process[]>();

  protected readonly files = signal<File[]>([]);
  protected readonly rows = computed(() => this.files().map(file => ({ file, pdf: this.#isPdf(file) })));
  // Names of the picked files that are not PDFs, comma separated (empty when all are PDFs).
  protected readonly notPdf = computed(() =>
    this.rows()
      .filter(row => !row.pdf)
      .map(row => row.file.name)
      .join(', ')
  );
  protected readonly isUploading = signal(false);
  protected readonly uploadedCount = signal(0);
  protected readonly error = signal<UploadError | null>(null);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.#add(input.files);
    // Lets the user pick the same file again after removing it.
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#add(event.dataTransfer?.files);
  }

  protected remove(file: File): void {
    this.files.update(files => files.filter(item => item !== file));
  }

  protected clear(): void {
    this.files.set([]);
    this.error.set(null);
  }

  protected upload(): void {
    const files = this.files();
    if (!files.length || this.notPdf()) return;

    this.isUploading.set(true);
    this.uploadedCount.set(0);
    this.error.set(null);
    this.#documentApi
      .upload(files)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: processes => {
          this.isUploading.set(false);
          this.files.set([]);
          this.uploadedCount.set(processes.length);
          this.uploaded.emit(processes);
        },
        error: (error: HttpErrorResponse) => {
          this.isUploading.set(false);
          this.error.set(this.#toError(error));
        }
      });
  }

  #add(list: FileList | null | undefined): void {
    if (!list?.length) return;
    const known = new Set(this.files().map(file => `${file.name}|${file.size}`));
    const added = [...list].filter(file => !known.has(`${file.name}|${file.size}`));
    this.files.update(files => [...files, ...added]);
    this.uploadedCount.set(0);
    this.error.set(null);
  }

  #isPdf(file: File): boolean {
    return file.name.toLowerCase().endsWith('.pdf');
  }

  // 400: no file, or some file is not a PDF (`{ msg, files }`); anything else is a generic failure.
  #toError(error: HttpErrorResponse): UploadError {
    if (error.status !== 400) return { key: 'UPLOAD.ERRORS.UPLOAD_FAILED' };
    const rejected = (error.error as { files?: string[] } | null)?.files;
    return rejected?.length
      ? { key: 'UPLOAD.ERRORS.REJECTED_FILES', params: { files: rejected.join(', ') } }
      : { key: 'UPLOAD.ERRORS.NO_FILES' };
  }
}
