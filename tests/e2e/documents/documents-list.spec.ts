import { expect, test } from '@playwright/test';
import { API, buildDocument, login, mockDocuments, mockUser, userWithProfile } from '../support/mock-api';

test.describe('CV history', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await mockUser(page, userWithProfile);
    await mockDocuments(page, () => [buildDocument(2, 'COMPLETED'), buildDocument(1, 'ERROR', { error_message: 'PDF illeggibile' })]);
  });

  test('is reachable from the header and lists the CVs with their status', async ({ page }) => {
    await page.goto('/main');
    await page.getByRole('navigation').getByRole('link', { name: 'Storico CV' }).click();

    await expect(page).toHaveURL(/\/documents$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Storico CV');
    const rows = page.getByRole('listitem').filter({ has: page.getByRole('link') });
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText('cv-2.pdf');
    await expect(rows.first()).toContainText('Caricato il');
    await expect(rows.first()).toContainText('Completato');
  });

  test('shows what was extracted from a CV and downloads it', async ({ page }) => {
    await page.route(`${API}/documents/download/2`, route =>
      route.fulfill({ body: Buffer.from('%PDF-1.4'), contentType: 'application/pdf' })
    );
    await page.goto('/documents');
    await page.getByRole('link', { name: /cv-2\.pdf/ }).click();

    await expect(page).toHaveURL(/\/documents\/2$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('cv-2.pdf');
    await expect(page.getByRole('region', { name: 'Nome e cognome' })).toContainText('Mario Rossi');
    await expect(page.getByRole('list', { name: 'Linguaggi' }).getByRole('listitem')).toHaveText(['Python', 'Java']);
    await expect(page.getByRole('list', { name: 'Framework' }).getByRole('listitem')).toHaveText(['Angular', 'Spring Boot']);
    await expect(page.getByRole('heading', { name: 'Developer' })).toBeVisible();
    await expect(page.getByText('set 2020 – in corso')).toBeVisible();
    await expect(page.getByText('gen 2019 – giu 2019')).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Scarica PDF' }).click();
    expect((await download).suggestedFilename()).toBe('cv-2.pdf');
  });

  test('shows the BE error of a failed analysis', async ({ page }) => {
    await page.goto('/documents/1');

    await expect(page.getByRole('alert')).toHaveText('PDF illeggibile');
    await page.getByRole('link', { name: 'Storico CV' }).last().click();
    await expect(page).toHaveURL(/\/documents$/);
  });
});
