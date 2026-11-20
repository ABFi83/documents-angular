import { expect, test } from '@playwright/test';
import { API, buildUser, login, mockUser, MockUser, userWithProfile } from '../support/mock-api';

const pdf = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') };
// The component polls the process every 5 seconds.
const POLLING_TIMEOUT = { timeout: 10_000 };

test.describe('document upload', () => {
  let user: MockUser;

  test.beforeEach(async ({ page }) => {
    user = buildUser();
    await login(page);
    await mockUser(page, () => user);
    await page.route(`${API}/documents`, route => route.fulfill({ json: { id: 7 } }));
  });

  test('rejects a file that is not a PDF', async ({ page }) => {
    await page.goto('/main');

    await page.getByLabel('Carica il tuo CV').setInputFiles({ name: 'cv.txt', mimeType: 'text/plain', buffer: Buffer.from('cv') });

    await expect(page.getByRole('alert')).toHaveText('Il formato deve essere PDF');
    await expect(page.getByRole('button', { name: 'Procedi' })).toHaveCount(0);
  });

  test('uploads a PDF, waits for the processing and shows the profile', async ({ page }) => {
    await page.route(`${API}/process/7`, route => {
      user = userWithProfile();
      return route.fulfill({ json: { id: 7, userId: 1, status: 'COMPLETED', error_message: null, start_end: '', endEnd: null } });
    });
    await page.goto('/main');

    await page.getByLabel('Carica il tuo CV').setInputFiles(pdf);
    await page.getByRole('button', { name: 'Procedi' }).click();

    await expect(page.getByRole('button', { name: 'ACME Developer' })).toBeVisible(POLLING_TIMEOUT);
  });

  test('shows the BE error when the processing fails', async ({ page }) => {
    await page.route(`${API}/process/7`, route =>
      route.fulfill({ json: { id: 7, userId: 1, status: 'ERROR', error_message: 'PDF illeggibile', start_end: '', endEnd: null } })
    );
    await page.goto('/main');

    await page.getByLabel('Carica il tuo CV').setInputFiles(pdf);
    await page.getByRole('button', { name: 'Procedi' }).click();

    await expect(page.getByRole('alert')).toHaveText('PDF illeggibile', POLLING_TIMEOUT);
  });
});
