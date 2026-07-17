import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages';

const PROGRAM_NAME = 'Web Development 2026';
const DEFAULT_DESCRIPTION = 'Full-stack web development program for 2026 cohort.';

test('TC-001 — Reject program name with only whitespace', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fillProgramName('   ');
  await dialog.blurProgramName();

  await expect(dialog.createButton).toBeDisabled();
  await expect(dialog.root).toBeVisible();
});

test('TC-002 — Accept program name with special characters', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Informatique & IA - Niveau 2 ${Date.now()}`;

  await programs.goto();
  const dialog = await programs.openNewProgramDialog();

  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.root).toBeHidden();
  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-003 — Reject duplicate program name', async ({ page }) => {
  test.fail(true, 'Known demo bug — duplicate program names are silently accepted on create.');

  const programs = new ProgramsPage(page);
  const programName = `${PROGRAM_NAME} ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  const dialog = await programs.openNewProgramDialog();
  await expect(dialog.root).toBeVisible();
  await dialog.fill(programName, DEFAULT_DESCRIPTION);
  await dialog.create();

  await expect(dialog.duplicateNameError).toBeVisible();
  await expect(dialog.root).toBeVisible();
  await expect(programs.getProgramByName(programName)).toHaveCount(1);
});
