import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages';

const DEFAULT_DESCRIPTION = 'Program for semester panel selection coverage.';

test(
  'TC-001 — Selecting a program reveals the semester panel',
  { tag: '@smoke' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = `Semester Panel Program ${Date.now()}`;

    await programs.goto();
    await expect(programs.selectProgramHint).toBeVisible();

    await programs.createProgram(programName, DEFAULT_DESCRIPTION);
    await programs.selectProgramInList(programName);

    await expect(programs.selectProgramHint).toBeHidden();
    await expect(programs.semesterPanelHeading(programName)).toBeVisible();
    await expect(programs.semesterSectionSubtitle).toBeVisible();
    await expect(programs.addSemesterButton).toBeVisible();
    await expect(programs.noSemestersMessage).toBeVisible();
  },
);

test(
  'TC-002 — Switching selection updates the semester panel heading',
  { tag: '@e2e' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    const suffix = Date.now();
    const programA = `Semester Panel Alpha ${suffix}`;
    const programB = `Semester Panel Beta ${suffix}`;

    await programs.goto();
    await programs.createProgram(programA, DEFAULT_DESCRIPTION);
    await programs.createProgram(programB, DEFAULT_DESCRIPTION);

    await programs.selectProgramInList(programA);
    await expect(programs.semesterPanelHeading(programA)).toBeVisible();

    await programs.selectProgramInList(programB);
    await expect(programs.semesterPanelHeading(programB)).toBeVisible();
    await expect(programs.semesterPanelHeading(programA)).toBeHidden();
  },
);
