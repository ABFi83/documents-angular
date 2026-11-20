export interface UploadedDocument {
  id: number;
  title: string;
  metaData: string;
  filePath: string;
  version: number;
  createdAt: string;
}

export interface UploadResponse {
  // Id of the process that parses the uploaded document.
  id: number;
}

export type ProcessStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';

export interface Process {
  id: number;
  userId: number;
  status: ProcessStatus;
  error_message: string | null;
  start_end: string;
  endEnd: string | null;
}
