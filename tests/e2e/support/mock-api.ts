import { Page } from '@playwright/test';

export const API = 'http://127.0.0.1:5000';
const TOKEN_KEY = 'auth_token';

export interface MockUser {
  id: number;
  name: string;
  surname: string;
  username: string;
  skill: { id: number; name: string }[];
  experience: {
    id: number;
    company_name: string;
    role: string;
    description: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
  }[];
  documents: MockDocument[];
}

export type MockStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';

export interface MockExtraction {
  nome: string | null;
  cognome: string | null;
  linguaggi: string[];
  frameworks: string[];
  esperienze: { azienda: string; ruolo: string; start_date: string | null; end_date: string | null; description: string | null }[];
}

export interface MockDocument {
  id: number;
  title: string;
  meta_data: string;
  file_path: string;
  version: number;
  created_at: string;
  process?: {
    id: number;
    user_id: number;
    document_id: number;
    status: MockStatus;
    start_date: string;
    end_date: string | null;
    error_message: string | null;
    result: MockExtraction | null;
  };
}

export const extraction = (): MockExtraction => ({
  nome: 'Mario',
  cognome: 'Rossi',
  linguaggi: ['Python', 'Java'],
  frameworks: ['Angular', 'Spring Boot'],
  esperienze: [
    { azienda: 'ACME', ruolo: 'Developer', start_date: '2020-09-01', end_date: null, description: 'Frontend Angular' },
    { azienda: 'Beta', ruolo: 'Intern', start_date: '2019-01-01', end_date: '2019-06-01', description: null }
  ]
});

/** A CV of the history with its analysis in the given state. */
export function buildDocument(id: number, status: MockStatus, overrides: Partial<NonNullable<MockDocument['process']>> = {}): MockDocument {
  return {
    id,
    title: `cv-${id}.pdf`,
    meta_data: '',
    file_path: `uploads/cv-${id}.pdf`,
    version: 1,
    created_at: '2026-11-20T15:04:05',
    process: {
      id,
      user_id: 1,
      document_id: id,
      status,
      start_date: '2026-11-20T15:04:05',
      end_date: status === 'COMPLETED' || status === 'ERROR' ? '2026-11-20T15:04:09' : null,
      error_message: null,
      result: status === 'COMPLETED' ? extraction() : null,
      ...overrides
    }
  };
}

/** Serves `GET /documents` and `GET /documents/<id>`, calling `documents` on every request so a test can change them. */
export async function mockDocuments(page: Page, documents: () => MockDocument[]): Promise<void> {
  await page.route(`${API}/documents`, (route, request) =>
    request.method() === 'GET' ? route.fulfill({ json: documents() }) : route.fallback()
  );
  await page.route(new RegExp(`${API}/documents/\\d+$`), route => {
    const id = Number(route.request().url().split('/').pop());
    const document = documents().find(item => item.id === id);
    return document ? route.fulfill({ json: document }) : route.fulfill({ status: 404, json: { msg: 'Document not found' } });
  });
}

export function buildUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 1,
    name: 'Mario',
    surname: 'Rossi',
    username: 'mario@example.com',
    skill: [],
    experience: [],
    documents: [],
    ...overrides
  };
}

export const userWithProfile = (): MockUser =>
  buildUser({
    skill: [
      { id: 1, name: 'Angular' },
      { id: 2, name: 'TypeScript' }
    ],
    experience: [
      {
        id: 10,
        company_name: 'ACME',
        role: 'Developer',
        description: 'Frontend',
        start_date: '2020-01-01',
        end_date: 'Present',
        is_current: true
      }
    ],
    documents: [{ id: 1, title: 'cv.pdf', meta_data: '', file_path: 'cv.pdf', version: 1, created_at: '2026-01-01T10:00:00' }]
  });

/** Serves `GET /users`, calling `user` on every request so a test can swap the user mid-flow. */
export async function mockUser(page: Page, user: () => MockUser): Promise<void> {
  await page.route(`${API}/users`, route => route.fulfill({ json: user() }));
}

/** Starts the page already logged in. */
export async function login(page: Page): Promise<void> {
  await page.addInitScript(key => localStorage.setItem(key, 'jwt'), TOKEN_KEY);
}
