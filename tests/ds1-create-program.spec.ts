import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'));
});

test('TC-001 — Program creation form is accessible from Programs page', async ({ page }) => {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Create' })).toBeVisible();
});
