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
  level: string;
}

export interface Experience {
  id: number;
  companyName: string;
  role: string;
  startDate: Date | null;
  endDate: Date | null;
  description?: string | null;
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

