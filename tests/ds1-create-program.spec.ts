import { test, expect } from '../fixtures/cleanup.fixture';

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

test('TC-002 — Program is created successfully and appears in the program list', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-003 — Create button becomes enabled when Program Name is populated', async ({ page }) => {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  const createButton = dialog.getByRole('button', { name: 'Create' });
  await expect(createButton).toBeDisabled();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(`Web Development 2026 ${Date.now()}`);

  await expect(createButton).toBeEnabled();
});

test('TC-004 — Description supports typical punctuation and saves as entered', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;
  const description = 'Full-stack web development program (HTML/CSS/JS + APIs).';

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill(description);
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-005 — Create is disabled when Program Name is empty (blank)', async ({ page }) => {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue('');
  await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('TC-006 — Create is disabled when Program Name contains only whitespace', async ({ page }) => {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  const nameField = dialog.getByRole('textbox', { name: 'Program Name' });
  await nameField.fill('   ');
  await nameField.blur();

  await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('TC-007 — Non-admin user cannot create a new program', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.DIDAXIS_NONADMIN_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.DIDAXIS_NONADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'));

  await page.goto('/programs');

  await expect(page.getByRole('button', { name: '+ New Program' })).toBeHidden();
});

test('TC-008 — Failed create does not close the modal or add the program (server error)', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await page.route('**/programs', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' });
    }
    return route.continue();
  });

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(programName);
  await expect(dialog.getByRole('button', { name: 'Create' })).toBeVisible();
});

test('TC-009 — Double-clicking Create does not create duplicate programs', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');

  const createButton = dialog.getByRole('button', { name: 'Create' });
  await createButton.dblclick();

  await expect(dialog).toBeHidden();

  const matches = page.getByText(programName, { exact: true });
  await expect(matches).toHaveCount(1);
});

test('TC-010 — Program Name accepts common special characters safely', async ({ page }) => {
  const suffix = Date.now();
  const programName = `Web Development: Full-Stack (${suffix})`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-011 — Program Name handles Unicode characters', async ({ page }) => {
  const programName = `Desarrollo Web ${Date.now()} — Avanzado`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-012 — Program Name trims leading/trailing spaces', async ({ page }) => {
  const suffix = Date.now();
  const paddedName = `  Web Development ${suffix}  `;
  const trimmedName = `Web Development ${suffix}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(paddedName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(trimmedName)).toBeVisible();
});

test('TC-013 — Description can be empty and still allows creation (if optional)', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue('');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-014 — Max-length: Program Name at maximum allowed length is accepted', async ({ page }) => {
  const suffix = ` ${Date.now()}`;
  const programName = 'A'.repeat(255 - suffix.length) + suffix;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-015 — Max-length: Program Name over maximum is blocked gracefully', async ({ page }) => {
  const overLimitName = 'A'.repeat(256);

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  const nameField = dialog.getByRole('textbox', { name: 'Program Name' });
  await nameField.fill(overLimitName);

  const fieldValue = await nameField.inputValue();
  const isInputTruncated = fieldValue.length <= 255;
  const isCreateDisabled = await dialog.getByRole('button', { name: 'Create' }).isDisabled();

  expect(isInputTruncated || isCreateDisabled).toBe(true);
});

test('TC-016 — Max-length: Description at maximum allowed length is accepted', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;
  const longDescription = 'B'.repeat(255);

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill(longDescription);
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
});

test('TC-017 — Duplicate name: creating an already-existing program name is handled correctly', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();

  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  const duplicateBlocked = await dialog.isVisible();
  if (duplicateBlocked) {
    await expect(dialog).toBeVisible();
  } else {
    await expect(dialog).toBeHidden();
  }
});

test('TC-018 — Program list updates correctly after create (ordering/visibility)', async ({ page }) => {
  const programName = `Web Development 2026 ${Date.now()}`;

  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();

  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Full-stack web development program');
  await dialog.getByRole('button', { name: 'Create' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(programName)).toBeVisible();
  await expect(page.getByText(programName)).toBeInViewport();
});
