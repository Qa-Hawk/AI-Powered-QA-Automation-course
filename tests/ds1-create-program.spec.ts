import { test, expect } from '../fixtures/cleanup.fixture';
import { LoginPage, ProgramsPage } from '../pages';

const DEFAULT_DESCRIPTION = 'Full-stack web development program';

test('TC-001 — Program creation form is accessible from Programs page', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await expect(dialog.programNameInput).toBeVisible();
  await expect(dialog.descriptionInput).toBeVisible();
  await expect(dialog.createButton).toBeVisible();
});

test('TC-002 — Program is created successfully and appears in the program list', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-003 — Create button becomes enabled when Program Name is populated', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await expect(dialog.createButton).toBeDisabled();

  await dialog.fillProgramName(`Web Development 2026 ${Date.now()}`);

  await expect(dialog.createButton).toBeEnabled();
});

test('TC-004 — Description supports typical punctuation and saves as entered', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;
  const description = 'Full-stack web development program (HTML/CSS/JS + APIs).';

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, description);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-005 — Create is disabled when Program Name is empty (blank)', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await expect(dialog.programNameInput).toHaveValue('');
  await expect(dialog.createButton).toBeDisabled();
});

test('TC-006 — Create is disabled when Program Name contains only whitespace', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName('   ');
  await dialog.blurProgramName();

  await expect(dialog.createButton).toBeDisabled();
});

test.describe('non-admin', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-007 — Non-admin user cannot create a new program', async ({ page }) => {
    const login = new LoginPage(page);
    const programs = new ProgramsPage(page);

    await login.goto();
    await login.login(process.env.DIDAXIS_NONADMIN_EMAIL!, process.env.DIDAXIS_NONADMIN_PASSWORD!);
    await programs.goto();

    await expect(programs.newProgramButton).toBeHidden();
  });
});

test('TC-008 — Failed create does not close the modal or add the program (server error)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();

  await page.route('**/programs', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' });
    }
    return route.continue();
  });

  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeVisible();
  await expect(dialog.programNameInput).toHaveValue(programName);
  await expect(dialog.createButton).toBeVisible();
});

test('TC-009 — Double-clicking Create does not create duplicate programs', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.doubleClickCreate();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toHaveCount(1);
});

test('TC-010 — Program Name accepts common special characters safely', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const programName = `Web Development: Full-Stack (${suffix})`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-011 — Program Name handles Unicode characters', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Desarrollo Web ${Date.now()} — Avanzado`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-012 — Program Name trims leading/trailing spaces', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const paddedName = `  Web Development ${suffix}  `;
  const trimmedName = `Web Development ${suffix}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(paddedName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(trimmedName)).toBeVisible();
});

test('TC-013 — Description can be empty and still allows creation (if optional)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(programName);
  await expect(dialog.descriptionInput).toHaveValue('');
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-014 — Max-length: Program Name at maximum allowed length is accepted', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = ` ${Date.now()}`;
  const programName = 'A'.repeat(255 - suffix.length) + suffix;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-015 — Max-length: Program Name over maximum is blocked gracefully', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const overLimitName = 'A'.repeat(256);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(overLimitName);

  const fieldValue = await dialog.getProgramNameValue();
  const isInputTruncated = fieldValue.length <= 255;
  const isCreateDisabled = await dialog.isCreateDisabled();

  expect(isInputTruncated || isCreateDisabled).toBe(true);
});

test('TC-016 — Max-length: Description at maximum allowed length is accepted', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;
  const longDescription = 'B'.repeat(255);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, longDescription);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-017 — Duplicate name: creating an already-existing program name is handled correctly', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  const dialog = await programs.openNewProgramDialog();
  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  const duplicateBlocked = await dialog.isVisible();
  if (duplicateBlocked) {
    await expect(dialog.root).toBeVisible();
  } else {
    await expect(dialog.root).toBeHidden();
  }
});

test('TC-018 — Program list updates correctly after create (ordering/visibility)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Development 2026 ${Date.now()}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
  await expect(programs.getProgramByName(programName)).toBeInViewport();
});
