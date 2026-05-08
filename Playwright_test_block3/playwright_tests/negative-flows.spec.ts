import { test, expect } from '@playwright/test';

const APP_URL = 'https://demo.playwright.dev/todomvc/#/';

async function addTodo(page, text: string) {
  await page.getByPlaceholder('What needs to be done?').fill(text);
  await page.getByPlaceholder('What needs to be done?').press('Enter');
}

function todoItems(page) {
  return page.locator('.todo-list li');
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test.describe('Negative Flows', () => {
  test('TC-013: Empty input does not create a todo item', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
    await expect(page.getByText('items left')).not.toBeVisible();
  });

  test('TC-014: Whitespace-only input does not create a todo item', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('     ');
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
    await expect(page.getByText('items left')).not.toBeVisible();
  });

  test('TC-015: Deleting a completed item does not affect active items', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');
    await addTodo(page, 'Bench press - 4 sets x 10 reps');

    const warmUp = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await warmUp.getByLabel('Toggle Todo').click();
    await expect(page.getByText('1 item left')).toBeVisible();

    await warmUp.hover();
    await warmUp.getByLabel('Delete').click();

    await expect(page.getByText('Warm up - 10 min treadmill')).not.toBeVisible();
    await expect(page.getByText('Bench press - 4 sets x 10 reps')).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-016: Editing a todo to empty text removes the item', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');

    const item = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await item.getByText('Warm up - 10 min treadmill').dblclick();

    const editInput = item.getByRole('textbox');
    await editInput.fill('');
    await editInput.press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-017: Pressing Escape during edit cancels the change', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');

    const item = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await item.getByText('Warm up - 10 min treadmill').dblclick();

    const editInput = item.getByRole('textbox');
    await editInput.fill('Something completely different');
    await editInput.press('Escape');

    await expect(page.getByText('Warm up - 10 min treadmill')).toBeVisible();
    await expect(page.getByText('Something completely different')).not.toBeVisible();
  });
});
