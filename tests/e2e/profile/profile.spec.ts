import { expect, test } from '@playwright/test';
import { API, buildDocument, extraction, login, mockDocuments, mockUser, userWithProfile } from '../support/mock-api';

test.describe('profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await mockUser(page, userWithProfile);
    await mockDocuments(page, () => [
      { ...buildDocument(4, 'COMPLETED', { result: { ...extraction(), linguaggi: ['Python'], frameworks: [] } }), title: 'cv-nuovo.pdf' },
      buildDocument(2, 'COMPLETED'),
      buildDocument(3, 'PENDING')
    ]);
  });

  test('lists the skills and experiences added by the user', async ({ page }) => {
    await page.goto('/main');

    const skills = page.locator('app-skills');
    await expect(skills.getByRole('listitem').filter({ hasText: 'Angular' })).toBeVisible();
    await expect(skills.getByRole('listitem').filter({ hasText: 'TypeScript' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ACME Developer' })).toBeVisible();
  });

  test('removes a skill', async ({ page }) => {
    let deletedUrl = '';
    await page.route(`${API}/users/skill/*`, route => {
      deletedUrl = route.request().url();
      return route.fulfill({ json: {} });
    });
    await page.goto('/main');

    const skills = page.locator('app-skills');
    await skills.getByRole('listitem').filter({ hasText: 'Angular' }).getByRole('button', { name: 'Rimuovi skill' }).click();

    await expect(skills.getByRole('listitem').filter({ hasText: 'Angular' })).toHaveCount(0);
    expect(deletedUrl).toBe(`${API}/users/skill/1`);
  });

  test('logs out from the menu', async ({ page }) => {
    await page.goto('/main');

    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#main-menu').getByText('Mario Rossi')).toBeVisible();
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('sums up the analyzed CVs, with the number of CVs per skill', async ({ page }) => {
    await page.goto('/main');

    const summary = page.locator('app-cv-summary');
    await expect(summary).toContainText('La somma di 2 CV analizzati');
    await expect(summary.getByRole('list', { name: 'Linguaggi' }).getByRole('listitem')).toHaveText([/Python\s*2 CV/, /Java\s*1 CV/]);
    await expect(summary.getByRole('list', { name: 'Framework' }).getByRole('listitem')).toHaveText([
      /Angular\s*1 CV/,
      /Spring Boot\s*1 CV/
    ]);
    // The same experience in both CVs appears once, with both CVs.
    await expect(summary.getByRole('heading', { level: 4 })).toHaveText(['Developer', 'Intern']);
    await expect(summary.getByRole('listitem').filter({ hasText: 'Developer' }).getByRole('link')).toHaveText(['cv-nuovo.pdf', 'cv-2.pdf']);
  });

  test('opens the CVs an item comes from', async ({ page }) => {
    await page.goto('/main');
    const summary = page.locator('app-cv-summary');

    // Found in one CV: the chip opens it.
    await summary.getByRole('link', { name: /Java/ }).click();
    await expect(page).toHaveURL(/\/documents\/2$/);

    // Found in more CVs: the chip lists them.
    await page.goBack();
    await summary.getByRole('button', { name: /Python/ }).click();
    await page.locator('[popover]:popover-open').getByRole('link', { name: 'cv-nuovo.pdf' }).click();
    await expect(page).toHaveURL(/\/documents\/4$/);
  });
});
