import { Locator, Page } from '@playwright/test';

export class ProgramDialog {
  readonly page: Page;
  readonly dialogName: string | RegExp;

  constructor(page: Page, dialogName: string | RegExp) {
    this.page = page;
    this.dialogName = dialogName;
  }

  get root(): Locator {
    return this.page.getByRole('dialog', { name: this.dialogName });
  }

  get programNameInput(): Locator {
    return this.root.getByRole('textbox', { name: 'Program Name' });
  }

  get descriptionInput(): Locator {
    return this.root.getByRole('textbox', { name: 'Description' });
  }

  get createButton(): Locator {
    return this.root.getByRole('button', { name: 'Create', exact: true });
  }

  get saveButton(): Locator {
    return this.root.getByRole('button', { name: 'Save' });
  }

  get cancelButton(): Locator {
    return this.root.getByRole('button', { name: 'Cancel' });
  }

  get closeButton(): Locator {
    return this.root.getByRole('button', { name: /close/i });
  }

  get showAiConfigButton(): Locator {
    return this.root.getByRole('button', { name: /Show AI Generation Config/i });
  }

  get duplicateNameError(): Locator {
    return this.root.getByText(/already exists|duplicate|name is taken/i);
  }

  async fillProgramName(name: string): Promise<void> {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async fill(name: string, description: string): Promise<void> {
    await this.fillProgramName(name);
    await this.fillDescription(description);
  }

  async create(): Promise<void> {
    await this.createButton.click();
  }

  async doubleClickCreate(): Promise<void> {
    await this.createButton.dblclick();
  }

  async blurProgramName(): Promise<void> {
    await this.programNameInput.blur();
  }

  async getProgramNameValue(): Promise<string> {
    return this.programNameInput.inputValue();
  }

  async isCreateDisabled(): Promise<boolean> {
    return this.createButton.isDisabled();
  }

  async isSaveDisabled(): Promise<boolean> {
    return this.saveButton.isDisabled();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async dismiss(): Promise<void> {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    } else {
      await this.closeButton.click();
    }
  }
}
