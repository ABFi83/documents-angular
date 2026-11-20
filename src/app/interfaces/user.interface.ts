import { UploadedDocument } from './document.interface';
import { Experience } from './experience.interface';
import { Skill } from './skill.interface';

export interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  skill: Skill[];
  experience: Experience[];
  documents: UploadedDocument[];
}
