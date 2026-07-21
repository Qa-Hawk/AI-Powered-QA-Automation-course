import { test, expect } from '@playwright/test';

const APP_URL = 'https://demo.playwright.dev/todomvc/#/';

async function addTodo(page, text: string) {
  await page.getByPlaceholder('What needs to be done?').fill(text);
  await page.getByPlaceholder('What needs to be done?').press('Enter');
}

function todoItems(page) {
  return page.getByTestId('todo-item');
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test.describe('Edge Cases', () => {
  test('TC-018: Special characters are preserved in todo text', async ({ page }) => {
    const specialText = 'Gym: legs & arms <today> "heavy" @Monday!';
    await addTodo(page, specialText);

    await expect(page.getByText(specialText)).toBeVisible();
    await expect(todoItems(page)).toHaveCount(1);
  });

  test('TC-019: Duplicate todo items are allowed', async ({ page }) => {
    await addTodo(page, 'Squats - 4 sets x 12 reps');
    await addTodo(page, 'Squats - 4 sets x 12 reps');

    await expect(todoItems(page)).toHaveCount(2);
    await expect(page.getByText('2 items left')).toBeVisible();

    const items = todoItems(page);
    await items.first().getByLabel('Toggle Todo').click();

    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(items.first()).toHaveClass(/completed/);
    await expect(items.last()).not.toHaveClass(/completed/);
  });

  test('TC-020: Very long todo text is handled gracefully', async ({ page }) => {
    const longText = 'A'.repeat(500);
    await addTodo(page, longText);

    await expect(todoItems(page)).toHaveCount(1);
    await expect(page.getByText('1 item left')).toBeVisible();

    const item = todoItems(page).first();
    await item.getByLabel('Toggle Todo').click();
    await expect(item.getByLabel('Toggle Todo')).toBeChecked();

    await item.hover();
    await item.getByLabel('Delete').click();
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-021: Rapid successive additions are all persisted', async ({ page }) => {
    const exerciseItems = Array.from({ length: 10 }, (_, i) => `Exercise ${i + 1}`);

    for (const item of exerciseItems) {
      await addTodo(page, item);
    }

    await expect(todoItems(page)).toHaveCount(10);
    await expect(page.getByText('10 items left')).toBeVisible();

    for (const item of exerciseItems) {
      await expect(page.getByText(item, { exact: true })).toBeVisible();
    }
  });

  test('TC-022: Page refresh persists todo items via localStorage', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');
    await addTodo(page, 'Bench press - 4 sets x 10 reps');

    const warmUp = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await warmUp.getByLabel('Toggle Todo').click();

    await page.reload();

    await expect(todoItems(page)).toHaveCount(2);
    await expect(page.getByText('1 item left')).toBeVisible();

    const warmUpAfter = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await expect(warmUpAfter.getByLabel('Toggle Todo')).toBeChecked();

    const benchAfter = todoItems(page).filter({ hasText: 'Bench press - 4 sets x 10 reps' });
    await expect(benchAfter.getByLabel('Toggle Todo')).not.toBeChecked();
  });

  test('TC-023: Single-character todo item is accepted', async ({ page }) => {
    await addTodo(page, 'A');

    await expect(todoItems(page)).toHaveCount(1);
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-024: Leading and trailing whitespace is trimmed', async ({ page }) => {
    await addTodo(page, '   Bench press   ');

    const item = todoItems(page).first();
    await expect(item).toContainText('Bench press');
    await expect(todoItems(page)).toHaveCount(1);
  });

  test('TC-025: Deleting the last remaining item hides the footer', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');
    await expect(todoItems(page)).toHaveCount(1);

    const item = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await item.hover();
    await item.getByLabel('Delete').click();

    await expect(todoItems(page)).toHaveCount(0);
    await expect(page.getByText('items left')).not.toBeVisible();
  });

  test('TC-026: Mark all as complete, then unmark all', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');
    await addTodo(page, 'Bench press - 4 sets x 10 reps');
    await addTodo(page, 'Squats - 4 sets x 12 reps');

    await page.getByLabel('Mark all as complete').click();

    await expect(page.getByText('0 items left')).toBeVisible();
    const items = todoItems(page);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).toHaveClass(/completed/);
    }

    await page.getByLabel('Mark all as complete').click();

    await expect(page.getByText('3 items left')).toBeVisible();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).not.toHaveClass(/completed/);
    }
  });
});
