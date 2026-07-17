import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CalendarPage extends BasePage {
  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Calendar', level: 2 });
  }

  get subtitle(): Locator {
    return this.page.getByText('Schedule sessions with drag-and-drop across month, week, and day views');
  }

  get programSelect(): Locator {
    return this.page.getByRole('textbox', { name: 'Program' });
  }

  get semesterSelect(): Locator {
    return this.page.getByRole('textbox', { name: 'Semester' });
  }

  get emptyStateMessage(): Locator {
    return this.page.getByText('Select a program and semester to view the calendar');
  }

  get emptyStateHint(): Locator {
    return this.page.getByText('Use the dropdowns above to choose a program, then a semester');
  }

  async goto(): Promise<void> {
    await this.page.goto('/calendar');
  }

  async openViaNav(): Promise<void> {
    await this.calendarNav.click();
    await this.heading.waitFor();
  }

  async selectProgram(programName: string): Promise<void> {
    await this.programSelect.click();
    await this.page.getByRole('option', { name: programName }).click();
  }

  async selectSemester(semesterName: string): Promise<void> {
    await this.semesterSelect.click();
    await this.page.getByRole('option', { name: semesterName }).click();
  }
}
