export interface Document {
  id: number;
  title: string;
  metaData: string;
  filePath: string;
  version: number;
  createdAt: Date;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  skill: Skill[];
  experience: Experience[];
  documents: Document[];
}

export interface Skill {
  id: number;
  name: string;
}

export interface Experience {
  id: number;
  company_name: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description?: string | null;
}

export interface Process {
  id: number;
  userId: number;
  status: ProcessStatus;
  error_message: string | null;
  start_end: Date;
  endEnd: Date | null;
}

export enum ProcessStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

