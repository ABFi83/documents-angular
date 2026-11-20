import { expect, test } from '@playwright/test';
import { API, login, mockUser, userWithProfile } from '../support/mock-api';

test.describe('profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await mockUser(page, userWithProfile);
  });

  test('lists the skills and experiences of the user', async ({ page }) => {
    await page.goto('/main');

    await expect(page.getByRole('listitem').filter({ hasText: 'Angular' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'TypeScript' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ACME - Developer' })).toBeVisible();
  });

  test('removes a skill', async ({ page }) => {
    let deletedUrl = '';
    await page.route(`${API}/users/skill/*`, route => {
      deletedUrl = route.request().url();
      return route.fulfill({ json: {} });
    });
    await page.goto('/main');

    await page.getByRole('listitem').filter({ hasText: 'Angular' }).getByRole('button', { name: 'Rimuovi skill' }).click();

    await expect(page.getByRole('listitem').filter({ hasText: 'Angular' })).toHaveCount(0);
    expect(deletedUrl).toBe(`${API}/users/skill/1`);
  });

  test('logs out from the menu', async ({ page }) => {
    await page.goto('/main');

    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByText('Mario Rossi')).toBeVisible();
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
