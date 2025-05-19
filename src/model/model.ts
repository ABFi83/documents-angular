export interface Document {
  id: number;
  title: string;
  content: string;
  ownerId: number;
}

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  surname: string;
  documents: Document[];
}
export interface Process {
  id: number;
  userId: number;
  status: ProcessStatus;
  startEnd: Date;
  endEnd: Date | null;
}

export enum ProcessStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

