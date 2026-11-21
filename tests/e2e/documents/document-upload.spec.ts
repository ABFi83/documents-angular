import { expect, test } from '@playwright/test';
import { API, buildDocument, buildUser, login, mockDocuments, MockDocument, mockUser } from '../support/mock-api';

const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });

test.describe('document upload', () => {
  let documents: MockDocument[];

  test.beforeEach(async ({ page }) => {
    documents = [];
    await login(page);
    await mockUser(page, () => buildUser());
    await mockDocuments(page, () => documents);
  });

  test('takes several PDFs and refuses any other file', async ({ page }) => {
    await page.goto('/main');
    const input = page.getByLabel('Scegli i CV');
    await expect(input).toHaveAttribute('accept', 'application/pdf');

    await input.setInputFiles([pdf('a.pdf'), { name: 'cv.txt', mimeType: 'text/plain', buffer: Buffer.from('cv') }]);

    await expect(page.getByRole('alert')).toHaveText('Sono accettati solo PDF. Rimuovi: cv.txt');
    await expect(page.getByRole('button', { name: /^Carica/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Rimuovi cv.txt' }).click();
    await expect(page.getByRole('button', { name: 'Carica 1 CV' })).toBeVisible();
  });

  test('uploads the CVs, then follows their analysis in the history', async ({ page }) => {
    let uploaded = 0;
    await page.route(`${API}/documents`, (route, request) => {
      if (request.method() !== 'POST') return route.fallback();
      uploaded = (request.postData()?.match(/name="files"/g) ?? []).length;
      documents = [buildDocument(2, 'PENDING'), buildDocument(1, 'PENDING')];
      return route.fulfill({ status: 202, json: documents.map(item => item.process) });
    });
    await page.goto('/main');

    await page.getByLabel('Scegli i CV').setInputFiles([pdf('cv-1.pdf'), pdf('cv-2.pdf')]);
    await page.getByRole('button', { name: 'Carica 2 CV' }).click();

    await expect(page).toHaveURL(/\/documents$/);
    expect(uploaded).toBe(2);
    await expect(page.getByText('In attesa')).toHaveCount(2);

    documents = [buildDocument(2, 'COMPLETED'), buildDocument(1, 'ERROR', { error_message: 'PDF illeggibile' })];
    await expect(page.getByText('Completato')).toBeVisible();
    await expect(page.getByText('Errore', { exact: true })).toBeVisible();
  });

  test('names the files the BE rejects', async ({ page }) => {
    await page.route(`${API}/documents`, (route, request) =>
      request.method() === 'POST'
        ? route.fulfill({ status: 400, json: { msg: 'Sono accettati solo PDF', files: ['finto.pdf'] } })
        : route.fallback()
    );
    await page.goto('/main');

    await page.getByLabel('Scegli i CV').setInputFiles(pdf('finto.pdf'));
    await page.getByRole('button', { name: 'Carica 1 CV' }).click();

    await expect(page.getByRole('alert')).toHaveText('Il server ha rifiutato questi file perché non sono PDF: finto.pdf');
    await expect(page).toHaveURL(/\/main$/);
  });
});
