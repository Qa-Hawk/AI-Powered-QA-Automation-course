import { test, expect } from '../fixtures/cleanup.fixture';
import { LoginPage, ProgramsPage } from '../pages';

const PROGRAMS_LIST_GET = /\/api\/programs\/?$/;

function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}

test(
  'TC-001 — Programs page displays the list when programs exist',
  { tag: '@smoke' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = `Program List ${Date.now()}`;

    await programs.goto();
    await programs.createProgram(programName, `Curriculum overview for cohort ${Date.now()}`);

    await expect(programs.heading).toBeVisible();
    await expect(programs.programsTable).toBeVisible();
  },
);

test(
  'TC-002 — Each program shows its name and description',
  { tag: '@sanity' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const programName = `Program List ${suffix}`;
    const description = `Curriculum overview for cohort ${suffix}`;

    await programs.goto();
    await programs.createProgram(programName, description);

    await expect(programs.getProgramByName(programName)).toBeVisible();
    await expect(programs.getProgramDescription(description)).toBeVisible();
  },
);

test(
  'TC-003 — A newly created program appears in the list with its description',
  { tag: '@e2e' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const programName = `Program List ${suffix}`;
    const description = `Fresh cohort ${suffix}`;

    await programs.goto();
    await programs.createProgram(programName, description);

    await expect(programs.getProgramByName(programName)).toBeVisible();
    await expect(programs.getProgramDescription(description)).toBeVisible();
  },
);

test(
  'TC-004 — Empty state message and create prompt shown when no programs exist',
  { tag: '@regression' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);

    await page.route(PROGRAMS_LIST_GET, (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
      }
      return route.continue();
    });

    await programs.goto();

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.emptyStateCreateButton).toBeVisible();
  },
);

test(
  'TC-005 — Programs list load failure is handled gracefully',
  { tag: '@regression' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);

    await page.route(PROGRAMS_LIST_GET, (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 500, body: 'Internal Server Error' });
      }
      return route.continue();
    });

    await programs.goto();

    await expect(programs.heading).toBeVisible();
  },
);

test.describe('non-admin', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.skip(
    'TC-006 — Non-admin user access to the program list (skipped — creds unavailable)',
    { tag: '@regression' },
    async ({ page }) => {
      // Skipped: no non-admin credentials (DIDAXIS_NONADMIN_EMAIL / DIDAXIS_NONADMIN_PASSWORD) configured.
      const login = new LoginPage(page);
      const programs = new ProgramsPage(page);

      await login.goto();
      await login.login(process.env.DIDAXIS_NONADMIN_EMAIL!, process.env.DIDAXIS_NONADMIN_PASSWORD!);
      await programs.goto();

      await expect(programs.heading).toBeVisible();
      await expect(programs.programsTable).toBeVisible();
    },
  );
});

test(
  'TC-007 — Program name with special characters displays correctly',
  { tag: '@regression' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = `Web Dev & Design: Full-Stack (100%) ${Date.now()}`;

    await programs.goto();
    await programs.createProgram(programName, 'Special character name coverage.');

    await expect(programs.getProgramByName(programName)).toBeVisible();
  },
);

test(
  'TC-008 — Program name with Unicode displays correctly',
  { tag: '@regression' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = `Système Éducatif — 教育 ${Date.now()}`;

    await programs.goto();
    await programs.createProgram(programName, 'Unicode name coverage.');

    await expect(programs.getProgramByName(programName)).toBeVisible();
  },
);

test(
  'TC-009 — Long name and description render without breaking the list',
  { tag: '@sanity' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = repeatChar('N', 200);
    const description = repeatChar('D', 200);

    await programs.goto();
    await programs.createProgram(programName, description);

    await expect(programs.getProgramByName(programName)).toBeVisible();
    await expect(programs.getProgramDescription(description)).toBeVisible();
  },
);

test(
  'TC-010 — List remains consistent after page reload',
  { tag: '@e2e' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = `Program List ${Date.now()}`;

    await programs.goto();
    await programs.createProgram(programName, 'Reload consistency coverage.');
    await expect(programs.getProgramByName(programName)).toBeVisible();

    await page.reload();
    await expect(programs.heading).toBeVisible();
    await expect(programs.getProgramByName(programName)).toBeVisible();
  },
);
