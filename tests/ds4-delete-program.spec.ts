import { test, expect } from '../fixtures/cleanup.fixture';
import { LoginPage, ProgramsPage } from '../pages';

const DEFAULT_DESCRIPTION = 'Program created for DS-4 delete coverage.';

test('TC-001 — Delete program with confirmation', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Test Program ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  page.once('dialog', (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message().length).toBeGreaterThan(0);
    void dialog.accept();
  });
  await programs.clickDelete(programName);

  await expect(programs.getProgramByName(programName)).toBeHidden();
});

test('TC-002 — Cancel program deletion', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Test Program ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  await programs.cancelDeleteProgram(programName);

  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test('TC-003 — Delete icon is available per program row', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Test Program ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);

  await expect(programs.getDeleteButton(programName)).toBeVisible();
});

test('TC-004 — List updates without manual refresh after delete', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Test Program ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  await programs.deleteProgram(programName);

  await expect(programs.getProgramByName(programName)).toBeHidden();
});

test('TC-005 — Delete API failure does not remove the program', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Test Program ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  await page.route('**/api/programs/**', (route) => {
    if (route.request().method() === 'DELETE') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' });
    }
    return route.continue();
  });

  await programs.deleteProgram(programName);

  await expect(programs.getProgramByName(programName)).toBeVisible();
});

test.describe('non-admin', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.skip('TC-006 — Non-admin user cannot delete a program', async ({ page }) => {
    // Skipped: no non-admin credentials (DIDAXIS_NONADMIN_EMAIL / DIDAXIS_NONADMIN_PASSWORD) configured.
    const login = new LoginPage(page);
    const programs = new ProgramsPage(page);
    const programName = `Test Program ${Date.now()}`;

    await login.goto();
    await login.login(process.env.DIDAXIS_NONADMIN_EMAIL!, process.env.DIDAXIS_NONADMIN_PASSWORD!);
    await programs.goto();

    await expect(programs.getDeleteButton(programName)).toBeHidden();
  });
});

test('TC-007 — Deleting one of several similar names only removes the target', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const suffix = Date.now();
  const targetName = `Web Dev ${suffix}`;
  const similarName = `Web Dev ${suffix} Extra`;

  await programs.goto();
  await programs.createProgram(targetName, DEFAULT_DESCRIPTION);
  await programs.createProgram(similarName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(targetName)).toBeVisible();
  await expect(programs.getProgramByName(similarName)).toBeVisible();

  await programs.deleteProgram(targetName);

  await expect(programs.getProgramByName(targetName)).toBeHidden();
  await expect(programs.getProgramByName(similarName)).toBeVisible();
});

test('TC-008 — Double-clicking delete does not open duplicate confirmations / duplicate DELETEs', async ({ page }) => {
  test.fail(
    true,
    'Known demo bug (DS-30) — rapid double-delete opens two confirms and sends two DELETE requests.',
  );

  const programs = new ProgramsPage(page);
  const programName = `Test Program ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  let dialogCount = 0;
  let deleteCount = 0;

  page.on('dialog', async (dialog) => {
    dialogCount += 1;
    await dialog.accept();
  });

  page.on('request', (request) => {
    if (request.method() === 'DELETE' && /\/api\/programs\//.test(request.url())) {
      deleteCount += 1;
    }
  });

  await programs.doubleClickDelete(programName);

  await expect(programs.getProgramByName(programName)).toBeHidden();
  expect(dialogCount).toBe(1);
  expect(deleteCount).toBe(1);
});

test('TC-009 — Special characters in program name delete correctly', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Web Dev & Design: Full-Stack (100%) ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  await programs.deleteProgram(programName);

  await expect(programs.getProgramByName(programName)).toBeHidden();
});

test('TC-010 — Unicode program name delete correctly', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = `Système Éducatif — 教育 ${Date.now()}`;

  await programs.goto();
  await programs.createProgram(programName, DEFAULT_DESCRIPTION);
  await expect(programs.getProgramByName(programName)).toBeVisible();

  await programs.deleteProgram(programName);

  await expect(programs.getProgramByName(programName)).toBeHidden();
});
