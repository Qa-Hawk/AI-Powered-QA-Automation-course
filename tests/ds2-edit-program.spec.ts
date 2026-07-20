import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages';

const PROGRAM_NAME = 'Web Development 2026';
const PROGRAM_DESCRIPTION = 'Full-stack web development program for 2026 cohort.';

test('TC-001 — Edit form opens pre-populated with current program data', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await expect(dialog.programNameInput).toHaveValue(name);
  await expect(dialog.descriptionInput).toHaveValue(PROGRAM_DESCRIPTION);
});

test('TC-002 — Program name updates successfully and list reflects change immediately', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedName = `${name} - Updated`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(updatedName);
  await dialog.save();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(updatedName)).toBeVisible();
  await expect(programs.getProgramByName(name)).toBeHidden();
});

test('TC-003 — Editing only Description preserves Name and other fields', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedDescription = 'Updated description: includes React, Node.js, and CI/CD.';

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillDescription(updatedDescription);
  await dialog.save();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(name)).toBeVisible();

  const reopenedDialog = await programs.openEditDialogFromRow(name);
  await expect(reopenedDialog.root).toBeVisible();
  await expect(reopenedDialog.programNameInput).toHaveValue(name);
  await expect(reopenedDialog.descriptionInput).toHaveValue(updatedDescription);
});

test('TC-004 — Re-open edit shows persisted changes after save', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedName = `${name} - Persisted`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(updatedName);
  await dialog.save();
  await expect(dialog.root).toBeHidden();

  const reopenedDialog = await programs.openEditDialogFromRow(updatedName);
  await expect(reopenedDialog.root).toBeVisible();
  await expect(reopenedDialog.programNameInput).toHaveValue(updatedName);
});

test('TC-005 — Save blocked when Name is cleared (required field validation)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName('');
  await expect(dialog.saveButton).toBeDisabled();
  await expect(dialog.root).toBeVisible();
});

test('TC-006 — Duplicate Name is rejected (uniqueness constraint)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const nameA = `${PROGRAM_NAME} A ${suffix}`;
  const nameB = `${PROGRAM_NAME} B ${suffix}`;

  await programs.goto();
  await programs.createProgram(nameA, PROGRAM_DESCRIPTION);
  await programs.createProgram(nameB, 'Second program');

  const dialog = await programs.openEditDialogFromRow(nameA);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(nameB);
  await dialog.save();

  const dialogStillOpen = await dialog.isVisible();
  if (dialogStillOpen) {
    await expect(dialog.root).toBeVisible();
  }
  await expect(programs.getProgramByName(nameA)).toBeVisible();
});

test('TC-007 — Invalid input is not accepted (script injection attempt)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const xssPayload = `Web Dev <script>alert("x")</script> ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(xssPayload);
  await dialog.save();

  let alertFired = false;
  page.on('dialog', () => { alertFired = true; });
  await page.waitForTimeout(1000);
  expect(alertFired).toBe(false);

  const isVisible = await programs.hasVisibleScriptElement();
  expect(isVisible).toBe(false);
});

test('TC-008 — System should not create a new program when editing', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const updatedName = `${name} - Updated`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(updatedName);
  await dialog.save();
  await expect(dialog.root).toBeHidden();

  await expect(programs.getProgramByName(updatedName)).toHaveCount(1);
  await expect(programs.getProgramByName(name)).toHaveCount(0);
});

test('TC-009 — Save failure shows error and does not update the list', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();

  await page.route('**/programs/**', (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' });
    }
    return route.continue();
  });

  await dialog.fillDescription('Should not persist');
  await dialog.save();

  await expect(dialog.root).toBeVisible();
  await expect(dialog.programNameInput).toHaveValue(name);
});

test('TC-010 — Cancel/Close does not persist changes', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const attemptedName = `${name} - Should Not Save`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(attemptedName);
  await dialog.dismiss();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(name)).toBeVisible();
  await expect(programs.getProgramByName(attemptedName)).toBeHidden();

  const reopenedDialog = await programs.openEditDialogFromRow(name);
  await expect(reopenedDialog.root).toBeVisible();
  await expect(reopenedDialog.programNameInput).toHaveValue(name);
});

test('TC-011 — Name max-length boundary is enforced', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = ` ${Date.now()}`;
  const name = `${PROGRAM_NAME} ${Date.now()}`;
  const maxLengthName = 'A'.repeat(255 - suffix.length) + suffix;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(maxLengthName);
  await dialog.save();
  await expect(dialog.root).toBeHidden();

  await programs.goto();
  const editDialog = await programs.openEditDialogFromRow(maxLengthName);

  await expect(editDialog.root).toBeVisible();
  await editDialog.fillProgramName('B'.repeat(300));

  const fieldValue = await editDialog.getProgramNameValue();
  const isInputTruncated = fieldValue.length <= 255;
  const isSaveDisabled = await editDialog.isSaveDisabled();
  expect(isInputTruncated || isSaveDisabled).toBe(true);
});

test('TC-012 — Name supports common special characters without breaking UI/storage', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const specialName = `Web Development 2026 — Updated (C#/.NET + React) [Evening] ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(specialName);
  await dialog.save();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(specialName)).toBeVisible();
});

test('TC-013 — Leading/trailing whitespace is handled consistently', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const paddedName = `  ${PROGRAM_NAME} Trimmed ${suffix}  `;
  const trimmedName = `${PROGRAM_NAME} Trimmed ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName(paddedName);
  await dialog.save();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(trimmedName)).toBeVisible();
});

test('TC-014 — Description empty value behavior (clear description)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillDescription('');
  await dialog.save();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(name)).toBeVisible();

  const reopenedDialog = await programs.openEditDialogFromRow(name);
  await expect(reopenedDialog.root).toBeVisible();
  await expect(reopenedDialog.descriptionInput).toHaveValue('');
});

test('TC-015 — Very long Description saves or validates (boundary)', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;
  const longDescription = 'D'.repeat(5000);

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);

  await expect(dialog.root).toBeVisible();
  await dialog.fillDescription(longDescription);
  await dialog.save();

  const dialogVisible = await dialog.isVisible();
  if (!dialogVisible) {
    await expect(programs.getProgramByName(name)).toBeVisible();
  } else {
    await expect(dialog.root).toBeVisible();
  }
});

test('TC-016 — Concurrent update detection (stale edit session)', async ({ page, context }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const name = `${PROGRAM_NAME} ${suffix}`;

  await programs.goto();
  await programs.createProgram(name, PROGRAM_DESCRIPTION);

  const dialog = await programs.openEditDialogFromRow(name);
  await expect(dialog.root).toBeVisible();

  const page2 = await context.newPage();
  const programs2 = new ProgramsPage(page2);
  await programs2.goto();
  const dialog2 = await programs2.openEditDialogFromRow(name);
  await expect(dialog2.root).toBeVisible();
  await dialog2.fillProgramName(`${name} - By Session B`);
  await dialog2.save();
  await expect(dialog2.root).toBeHidden();
  await page2.close();

  await dialog.fillDescription('Changed by stale session A');
  await dialog.save();

  const dialogStillOpen = await dialog.isVisible();
  if (dialogStillOpen) {
    await expect(dialog.root).toBeVisible();
  } else {
    await expect(programs.getProgramByName(name)).toBeHidden();
  }
});
