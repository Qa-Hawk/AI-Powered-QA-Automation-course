import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Dashboard', level: 2 });
  }

  get welcomeText(): Locator {
    return this.page.getByText('Welcome to Didaxis Studio');
  }

  get connectedStatus(): Locator {
    return this.page.getByText('Connected');
  }

  get programsCard(): Locator {
    return this.page.getByText('Manage academic programs').locator('..');
  }

  get calendarCard(): Locator {
    return this.page.getByText('Schedule & drag-drop').locator('..');
  }

  get validationCard(): Locator {
    return this.page.getByText('Check for conflicts').locator('..');
  }

  get quickStartSection(): Locator {
    return this.page.getByText('Quick Start');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async openViaNav(): Promise<void> {
    await this.dashboardNav.click();
    await this.heading.waitFor();
  }
}
