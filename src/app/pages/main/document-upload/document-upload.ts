import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentApiService } from '@common/services/document-api.service';
import { Process } from '@interfaces/document.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { exhaustMap, first, interval } from 'rxjs';

const POLLING_INTERVAL_MS = 5000;

@Component({
  selector: 'app-document-upload',
  imports: [TranslatePipe],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.scss'
})
export class DocumentUpload {
  #documentApi = inject(DocumentApiService);
  #translate = inject(TranslateService);
  #destroyRef = inject(DestroyRef);

  uploadCompleted = output();

  protected readonly file = signal<File | null>(null);
  protected readonly isPdf = computed(() => this.file()?.name.endsWith('.pdf') ?? false);
  protected readonly isUploading = signal(false);
  protected readonly uploadSuccess = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.file.set(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file) this.file.set(file);
  }

  protected clearFile(): void {
    this.file.set(null);
  }

  protected upload(): void {
    const file = this.file();
    if (!file || !this.isPdf()) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);
    this.#documentApi
      .upload(file.name, '', file)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: response => this.#pollProcess(response.id),
        error: () => this.#fail(this.#translate.instant('UPLOAD.ERRORS.UPLOAD_FAILED'))
      });
  }

  // Asks the BE every few seconds until the document is parsed or has failed.
  #pollProcess(id: number): void {
    interval(POLLING_INTERVAL_MS)
      .pipe(
        exhaustMap(() => this.#documentApi.process(id)),
        first((process: Process) => process.status === 'COMPLETED' || process.status === 'ERROR'),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: process => {
          if (process.status === 'ERROR') {
            this.#fail(process.error_message || this.#translate.instant('UPLOAD.ERRORS.PROCESS_FAILED'));
            return;
          }
          this.isUploading.set(false);
          this.uploadSuccess.set(true);
          this.uploadCompleted.emit();
        },
        error: error => console.error('Polling error occurred:', error)
      });
  }

  #fail(message: string): void {
    this.isUploading.set(false);
    this.uploadSuccess.set(false);
    this.errorMessage.set(message);
  }
}
