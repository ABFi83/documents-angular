import { Component, EventEmitter, Output, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from './document.service';
import { tap } from 'rxjs/operators';
import { ProcesService } from './process.service';
import { Process, ProcessStatus } from '../model/model';
import { Router } from '@angular/router';
@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css'],
  imports: [CommonModule]
})
export class DocumentUploadComponent {
  selectedFileName: string | null = null;
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  errorMessage: string | null = null;

  @Output() uploadCompleted= new EventEmitter<void>();


  constructor(private router: Router, private documentService: DocumentService, private procesService: ProcesService, private ngZone: NgZone) {

  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      console.log('File selected:', file.name);
      // Add logic to upload the file
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    console.log('File is being dragged over');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.selectedFileName = file.name;
      console.log('File dropped:', file.name);
      // Add logic to upload the file
      event.dataTransfer.clearData();
    } else {
      console.log('No file detected in drop event.');
    }
  }

  clearFile() {
    this.selectedFileName = null;
    console.log('File cleared');
  }

  onProceed() {
    if (this.selectedFileName && this.selectedFileName.endsWith('.pdf')) {
      console.log('Proceed button clicked');

      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (file) {

        this.isUploading = true;
        this.errorMessage = null; // Clear any previous error message
        this.documentService.uploadDocument(this.selectedFileName,"",file).pipe(
          tap({
            next: (response) => {
              console.log('Document uploaded successfully:', response);
              this.initializePolling(response.id); // Assuming the response contains the ID of the uploaded document
            },
            error: (error) => {
              console.error('Error uploading document:', error);
              this.isUploading = false;
              this.uploadSuccess = false;
              this.errorMessage = 'Errore durante il caricamento del documento. Riprova.';
            }
          })
        ).forEach(() => {});
      } else {
        console.error('No file found in the input element.');
      }
    } else {
      console.error('Invalid file format. Only PDF files are allowed.');
    }
  }

  private initializePolling(id: number) {
    const pollingInterval = 5000; // 5 seconds
    let pollingHandle: any;

    this.ngZone.runOutsideAngular(() => {
      const poll = () => {
        this.procesService.getProcess(id).subscribe({
          next: (process: Process) => {
            console.log('Polling status received:', process.status);
            if (process.status === ProcessStatus.COMPLETED) {
              this.ngZone.run(() => {
                this.isUploading = false;
                this.uploadSuccess = true;
                clearInterval(pollingHandle);
                this.uploadCompleted.emit();
              });
            }
            if (process.status === ProcessStatus.ERROR) {
              this.ngZone.run(() => {
                this.isUploading = false;
                this.uploadSuccess = false;
                console.log('Upload error via polling');
                this.errorMessage = process.error_message || 'Errore durante il caricamento del documento.';
                clearInterval(pollingHandle);
              });
            }
          },
          error: (err: any) => {
            this.ngZone.run(() => {
              console.error('Polling error occurred:', err);
              clearInterval(pollingHandle);
            });
          }
        });
      };
      pollingHandle = setInterval(poll, pollingInterval);
    });
  }
}
