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
