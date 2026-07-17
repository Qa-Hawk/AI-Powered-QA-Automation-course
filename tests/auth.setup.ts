import { test as setup } from '@playwright/test';
import { AUTH_FILE } from '../support/auth.constants';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'));

  await page.context().storageState({ path: AUTH_FILE });
});
