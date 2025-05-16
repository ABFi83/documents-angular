import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from './document.service';
import { tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

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
  private uploadStatusSocket: WebSocketSubject<any> | null = null;

    constructor(private documentService: DocumentService) {

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
              //this.initializeWebSocket();
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

  private initializeWebSocket() {
    this.uploadStatusSocket = new WebSocketSubject('ws://127.0.0.1:8080');

    this.uploadStatusSocket.subscribe({
      next: (message) => {
        console.log('WebSocket message received:', message);
        if (message.status === 'completed') {
          this.isUploading = false;
          this.uploadSuccess = true;
          console.log('Upload completed via WebSocket');
         //this.uploadStatusSocket?.complete();
        }
      },
      error: (err) => {
        console.error('WebSocket error occurred:', err);
        console.error('WebSocket URL:', 'wss://127.0.0.1:8080/upload-status');
        this.isUploading = false;
      },
      complete: () => {
        console.log('WebSocket connection closed');
      }
    });

    // Log WebSocket readyState after creation
    const webSocket = this.uploadStatusSocket as any;
    console.log('WebSocket initial readyState:', webSocket?.socket?.readyState);
  }
}
