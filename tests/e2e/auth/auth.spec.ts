import { expect, test } from '@playwright/test';
import { API, buildUser, mockUser } from '../support/mock-api';

test.describe('auth', () => {
  test('redirects to the login page without a token', async ({ page }) => {
    await page.goto('/main');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs in and lands on the upload when the user has no document', async ({ page }) => {
    await page.route(`${API}/auth/login`, route => route.fulfill({ json: { access_token: 'jwt' } }));
    await mockUser(page, () => buildUser());

    await page.goto('/login');
    await page.getByLabel('Username:').fill('mario@example.com');
    await page.getByLabel('Password:').fill('Secret1!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/main$/);
    await expect(page.getByText('Carica il tuo CV')).toBeVisible();
  });

  test('shows an error when the BE returns no token', async ({ page }) => {
    await page.route(`${API}/auth/login`, route => route.fulfill({ json: {} }));

    await page.goto('/login');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toHaveText('Credenziali non valide');
    await expect(page).toHaveURL(/\/login$/);
  });
});
