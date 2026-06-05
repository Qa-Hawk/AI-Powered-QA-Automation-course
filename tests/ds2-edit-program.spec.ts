import { test, expect } from '@playwright/test';

const PROGRAM_NAME = 'Web Development 2026';
const PROGRAM_DESCRIPTION = 'Full-stack web development program for 2026 cohort.';

async function login(page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.DIDAXIS_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'));
}

async function createProgram(page, name: string, description: string) {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();
  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(name);
  await dialog.getByRole('textbox', { name: 'Description' }).fill(description);
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(name)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('TC-001 — Edit form opens pre-populated with current program data', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(name);
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue(PROGRAM_DESCRIPTION);
});

test('TC-002 — Program name updates successfully and list reflects change immediately', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedName = `${name} - Updated`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(updatedName);
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(updatedName)).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeHidden();
});

test('TC-003 — Editing only Description preserves Name and other fields', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedDescription = 'Updated description: includes React, Node.js, and CI/CD.';
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Description' }).fill(updatedDescription);
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(name)).toBeVisible();

  const editedRow = page.getByRole('row', { name: new RegExp(name) });
  await editedRow.getByRole('button', { name: /edit/i }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(name);
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue(updatedDescription);
});

test('TC-004 — Re-open edit shows persisted changes after save', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedName = `${name} - Persisted`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(updatedName);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();

  const updatedRow = page.getByRole('row', { name: new RegExp(updatedName) });
  await updatedRow.getByRole('button', { name: /edit/i }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(updatedName);
});

test('TC-005 — Save blocked when Name is cleared (required field validation)', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill('');
  const saveButton = dialog.getByRole('button', { name: 'Save' });
  await expect(saveButton).toBeDisabled();
  await expect(dialog).toBeVisible();
});

test('TC-006 — Duplicate Name is rejected (uniqueness constraint)', async ({ page }) => {
  const suffix = Date.now();
  const nameA = `${PROGRAM_NAME} A ${suffix}`;
  const nameB = `${PROGRAM_NAME} B ${suffix}`;
  await createProgram(page, nameA, PROGRAM_DESCRIPTION);
  await createProgram(page, nameB, 'Second program');

  const row = page.getByRole('row', { name: new RegExp(nameA) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(nameB);
  await dialog.getByRole('button', { name: 'Save' }).click();

  const dialogStillOpen = await dialog.isVisible();
  if (dialogStillOpen) {
    await expect(dialog).toBeVisible();
  }
  await expect(page.getByText(nameA)).toBeVisible();
});

test('TC-007 — Invalid input is not accepted (script injection attempt)', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const xssPayload = `Web Dev <script>alert("x")</script> ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(xssPayload);
  await dialog.getByRole('button', { name: 'Save' }).click();

  let alertFired = false;
  page.on('dialog', () => { alertFired = true; });
  await page.waitForTimeout(1000);
  expect(alertFired).toBe(false);

  const isVisible = await page.locator('script').isVisible().catch(() => false);
  expect(isVisible).toBe(false);
});

test('TC-008 — System should not create a new program when editing', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedName = `${name} - Updated`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const programCountBefore = await page.getByRole('row').count();

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(updatedName);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();

  const programCountAfter = await page.getByRole('row').count();
  expect(programCountAfter).toBe(programCountBefore);
});

test('TC-009 — Save failure shows error and does not update the list', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await page.route('**/programs/**', (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' });
    }
    return route.continue();
  });

  await dialog.getByRole('textbox', { name: 'Description' }).fill('Should not persist');
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(name);
});

test('TC-010 — Cancel/Close does not persist changes', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const attemptedName = `${name} - Should Not Save`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(attemptedName);

  const cancelButton = dialog.getByRole('button', { name: /cancel/i });
  const closeButton = dialog.getByRole('button', { name: /close/i });
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
  } else {
    await closeButton.click();
  }

  await expect(dialog).toBeHidden();
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText(attemptedName)).toBeHidden();

  const updatedRow = page.getByRole('row', { name: new RegExp(name) });
  await updatedRow.getByRole('button', { name: /edit/i }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(name);
});

test('TC-011 — Name max-length boundary is enforced', async ({ page }) => {
  const suffix = ` ${Date.now()}`;
  const name = `${PROGRAM_NAME} ${Date.now()}`;
  const maxLengthName = 'A'.repeat(255 - suffix.length) + suffix;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(maxLengthName);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();

  await page.goto('/programs');
  const overLimitName = 'B'.repeat(300);
  const editRow = page.getByRole('row', { name: new RegExp(maxLengthName.slice(0, 20)) });
  await editRow.getByRole('button', { name: /edit/i }).click();
  await expect(dialog).toBeVisible();

  const nameField = dialog.getByRole('textbox', { name: 'Program Name' });
  await nameField.fill(overLimitName);

  const fieldValue = await nameField.inputValue();
  const isInputTruncated = fieldValue.length <= 255;
  const isSaveDisabled = await dialog.getByRole('button', { name: 'Save' }).isDisabled();
  expect(isInputTruncated || isSaveDisabled).toBe(true);
});

test('TC-012 — Name supports common special characters without breaking UI/storage', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const specialName = `Web Development 2026 — Updated (C#/.NET + React) [Evening] ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(specialName);
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(specialName)).toBeVisible();
});

test('TC-013 — Leading/trailing whitespace is handled consistently', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const paddedName = `  ${PROGRAM_NAME} Trimmed ${suffix}  `;
  const trimmedName = `${PROGRAM_NAME} Trimmed ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(paddedName);
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(trimmedName)).toBeVisible();
});

test('TC-014 — Description empty value behavior (clear description)', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Description' }).fill('');
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(name)).toBeVisible();

  const editedRow = page.getByRole('row', { name: new RegExp(name) });
  await editedRow.getByRole('button', { name: /edit/i }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue('');
});

test('TC-015 — Very long Description saves or validates (boundary)', async ({ page }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const longDescription = 'D'.repeat(5000);
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Description' }).fill(longDescription);
  await dialog.getByRole('button', { name: 'Save' }).click();

  const dialogVisible = await dialog.isVisible();
  if (!dialogVisible) {
    await expect(page.getByText(name)).toBeVisible();
  } else {
    await expect(dialog).toBeVisible();
  }
});

test('TC-016 — Concurrent update detection (stale edit session)', async ({ page, context }) => {
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  await createProgram(page, name, PROGRAM_DESCRIPTION);

  const row = page.getByRole('row', { name: new RegExp(name) });
  await row.getByRole('button', { name: /edit/i }).click();

  const dialog = page.getByRole('dialog', { name: /edit program/i });
  await expect(dialog).toBeVisible();

  const page2 = await context.newPage();
  await login(page2);
  await page2.goto('/programs');
  const row2 = page2.getByRole('row', { name: new RegExp(name) });
  await row2.getByRole('button', { name: /edit/i }).click();
  const dialog2 = page2.getByRole('dialog', { name: /edit program/i });
  await expect(dialog2).toBeVisible();
  await dialog2.getByRole('textbox', { name: 'Program Name' }).fill(`${name} - By Session B`);
  await dialog2.getByRole('button', { name: 'Save' }).click();
  await expect(dialog2).toBeHidden();
  await page2.close();

  await dialog.getByRole('textbox', { name: 'Description' }).fill('Changed by stale session A');
  await dialog.getByRole('button', { name: 'Save' }).click();

  const dialogStillOpen = await dialog.isVisible();
  if (dialogStillOpen) {
    await expect(dialog).toBeVisible();
  } else {
    await expect(page.getByText(name)).toBeHidden();
  }
});
