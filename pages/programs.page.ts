import { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ProgramDialog } from './program-dialog.page';

export class ProgramsPage extends BasePage {
  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Programs', level: 2 });
  }

  get subtitle(): Locator {
    return this.page.getByText('Manage academic programs and semesters');
  }

  get newProgramButton(): Locator {
    return this.page.getByRole('button', { name: '+ New Program' });
  }

  get emptyStateCreateButton(): Locator {
    return this.page.getByRole('button', { name: 'Create Program' });
  }

  get emptyStateMessage(): Locator {
    return this.page.getByText('No programs yet. Create your first program to get started.');
  }

  get programsTable(): Locator {
    return this.page.getByRole('table');
  }

  get selectProgramHint(): Locator {
    return this.page.getByText('Select a program to manage semesters');
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
  }

  async openViaNav(): Promise<void> {
    await this.programsNav.click();
    await this.heading.waitFor();
  }

  getProgramRow(name: string): Locator {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('row', { name: new RegExp(escaped) });
  }

  getProgramByName(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  getProgramDescription(description: string): Locator {
    return this.page.getByText(description, { exact: true });
  }

  getEditButton(programName: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`Edit ${programName}`, 'i') });
  }

  getDeleteButton(programName: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`Delete ${programName}`, 'i') });
  }

  async openNewProgramDialog(): Promise<ProgramDialog> {
    await this.newProgramButton.click();
    const dialog = new ProgramDialog(this.page, 'New Program');
    await dialog.root.waitFor();
    return dialog;
  }

  async openEmptyStateCreateDialog(): Promise<ProgramDialog> {
    await this.emptyStateCreateButton.click();
    const dialog = new ProgramDialog(this.page, 'New Program');
    await dialog.root.waitFor();
    return dialog;
  }

  async openEditDialog(programName: string): Promise<ProgramDialog> {
    await this.getEditButton(programName).click();
    const dialog = new ProgramDialog(this.page, /edit program/i);
    await dialog.root.waitFor();
    return dialog;
  }

  async openEditDialogFromRow(programName: string): Promise<ProgramDialog> {
    await this.getProgramRow(programName).getByRole('button', { name: /edit/i }).click();
    const dialog = new ProgramDialog(this.page, /edit program/i);
    await dialog.root.waitFor();
    return dialog;
  }

  async createProgram(name: string, description: string): Promise<void> {
    const dialog = await this.openNewProgramDialog();
    await dialog.fill(name, description);
    await dialog.create();
    await dialog.root.waitFor({ state: 'hidden' });
    await this.getProgramByName(name).waitFor({ state: 'visible' });
  }

  async getRowCount(): Promise<number> {
    return this.page.getByRole('row').count();
  }

  async hasVisibleScriptElement(): Promise<boolean> {
    return this.page.locator('script').isVisible().catch(() => false);
  }

  async deleteProgram(programName: string): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.getDeleteButton(programName).click();
  }
}
