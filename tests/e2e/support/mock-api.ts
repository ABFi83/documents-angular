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
  documents: { id: number; title: string; metaData: string; filePath: string; version: number; createdAt: string }[];
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
    documents: [{ id: 1, title: 'cv.pdf', metaData: '', filePath: 'cv.pdf', version: 1, createdAt: '2026-01-01' }]
  });

/** Serves `GET /users`, calling `user` on every request so a test can swap the user mid-flow. */
export async function mockUser(page: Page, user: () => MockUser): Promise<void> {
  await page.route(`${API}/users`, route => route.fulfill({ json: user() }));
}

/** Starts the page already logged in. */
export async function login(page: Page): Promise<void> {
  await page.addInitScript(key => localStorage.setItem(key, 'jwt'), TOKEN_KEY);
}
