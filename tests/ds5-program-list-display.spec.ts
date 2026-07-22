import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages';

const YOUTH_DESCRIPTION = 'A 12-week leadership program for high school students.';
const STEM_DESCRIPTION = 'Scholarships and mentoring for first-generation STEM majors.';
const SPECIAL_DESCRIPTION = 'Career support: CV review, mock interviews, and networking.';

async function mockEmptyProgramList(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/programs', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
      return;
    }

    await route.continue();
  });
}

test('TC-001 — Program list shows each program name with its description', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const youthName = `Youth Leadership 2026 ${suffix}`;
  const stemName = `STEM Scholars ${suffix}`;

  await programs.goto();
  await programs.createProgram(youthName, YOUTH_DESCRIPTION);
  await programs.createProgram(stemName, STEM_DESCRIPTION);

  await expect(programs.programsTable).toBeVisible();
  await expect(programs.getProgramRow(youthName)).toContainText(YOUTH_DESCRIPTION);
  await expect(programs.getProgramRow(stemName)).toContainText(STEM_DESCRIPTION);
});

test('TC-002 — Empty state shows a message and create-first-program prompt', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await mockEmptyProgramList(page);

  await programs.goto();

  await expect(programs.emptyStateMessage).toBeVisible();
  await expect(programs.emptyStateCreateButton).toBeVisible();
  await expect(programs.programsTable).toBeHidden();
});

test('TC-003 — Empty-state prompt opens the new program form', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await mockEmptyProgramList(page);

  await programs.goto();
  const dialog = await programs.openEmptyStateCreateDialog();

  await expect(dialog.root).toBeVisible();
  await expect(dialog.programNameInput).toBeVisible();
  await expect(dialog.descriptionInput).toBeVisible();
});

test('TC-004 — Empty state is not shown when a program exists', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Youth Leadership 2026 ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, YOUTH_DESCRIPTION);

  await expect(programs.getProgramByName(programName)).toBeVisible();
  await expect(programs.emptyStateMessage).toBeHidden();
  await expect(programs.emptyStateCreateButton).toBeHidden();
});

test('TC-005 — Special characters render correctly in program details', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Café & Résumé Prep ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, SPECIAL_DESCRIPTION);

  const row = programs.getProgramRow(programName);
  await expect(row).toContainText(programName);
  await expect(row).toContainText(SPECIAL_DESCRIPTION);
});
