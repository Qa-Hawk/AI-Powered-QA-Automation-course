import { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get dashboardNav(): Locator {
    return this.page.getByRole('button', { name: /Dashboard/i });
  }

  get programsNav(): Locator {
    return this.page.getByRole('button', { name: /Programs/i });
  }

  get calendarNav(): Locator {
    return this.page.getByRole('button', { name: /Calendar/i });
  }

  get validationNav(): Locator {
    return this.page.getByRole('button', { name: /Validation/i });
  }

  get schedulerNav(): Locator {
    return this.page.getByRole('button', { name: /Scheduler/i });
  }

  get exportNav(): Locator {
    return this.page.getByRole('button', { name: /Export/i });
  }

  get settingsNav(): Locator {
    return this.page.getByRole('button', { name: /Settings/i });
  }

  get signOutButton(): Locator {
    return this.page.getByRole('button', { name: /Sign out/i });
  }

  get userDisplayName(): Locator {
    return this.page.locator('nav').getByRole('paragraph').first();
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }
}
