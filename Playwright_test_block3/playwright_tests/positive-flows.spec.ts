import { test, expect } from '@playwright/test';

const APP_URL = 'https://demo.playwright.dev/todomvc/#/';

const GYM_ITEMS = [
  'Warm up - 10 min treadmill',
  'Bench press - 4 sets x 10 reps',
  'Squats - 4 sets x 12 reps',
  'Deadlifts - 3 sets x 8 reps',
  'Cool down - stretching 10 min',
];

async function addTodo(page, text: string) {
  await page.getByPlaceholder('What needs to be done?').fill(text);
  await page.getByPlaceholder('What needs to be done?').press('Enter');
}

async function addAllGymItems(page) {
  for (const item of GYM_ITEMS) {
    await addTodo(page, item);
  }
}

function todoItems(page) {
  return page.locator('.todo-list li');
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test.describe('Positive Flows', () => {
  test('TC-001: User can create a new todo item', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');

    const todoItem = page.getByText('Warm up - 10 min treadmill');
    await expect(todoItem).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-002: User can add 5 items to the todo list', async ({ page }) => {
    await addAllGymItems(page);

    await expect(todoItems(page)).toHaveCount(5);

    for (const item of GYM_ITEMS) {
      await expect(page.getByText(item)).toBeVisible();
    }

    await expect(page.getByText('5 items left')).toBeVisible();
  });

  test('TC-003: Completed item shows checked state and strikethrough', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');

    const item = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await item.getByLabel('Toggle Todo').click();

    await expect(item.getByLabel('Toggle Todo')).toBeChecked();
    await expect(item).toHaveClass(/completed/);
    await expect(page.getByText('0 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('TC-004: Removed item disappears from the list', async ({ page }) => {
    await addAllGymItems(page);
    await expect(page.getByText('5 items left')).toBeVisible();

    const deadliftsItem = todoItems(page).filter({ hasText: 'Deadlifts - 3 sets x 8 reps' });
    await deadliftsItem.hover();
    await deadliftsItem.getByLabel('Delete').click();

    await expect(page.getByText('Deadlifts - 3 sets x 8 reps')).not.toBeVisible();
    await expect(page.getByText('4 items left')).toBeVisible();
    await expect(todoItems(page)).toHaveCount(4);
  });

  test('TC-005: Items-left counter reflects only active items', async ({ page }) => {
    await addAllGymItems(page);

    const firstItem = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await firstItem.getByLabel('Toggle Todo').click();

    await expect(page.getByText('4 items left')).toBeVisible();
  });

  test('TC-006: "All" filter shows both active and completed items', async ({ page }) => {
    await addAllGymItems(page);

    const firstItem = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await firstItem.getByLabel('Toggle Todo').click();

    await page.getByRole('link', { name: 'All' }).click();

    await expect(todoItems(page)).toHaveCount(5);
  });

  test('TC-007: "Active" filter shows only uncompleted items', async ({ page }) => {
    await addAllGymItems(page);

    const firstItem = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await firstItem.getByLabel('Toggle Todo').click();

    await page.getByRole('link', { name: 'Active' }).click();

    await expect(todoItems(page)).toHaveCount(4);
    await expect(page.getByText('Warm up - 10 min treadmill')).not.toBeVisible();
  });

  test('TC-008: "Completed" filter shows only finished items', async ({ page }) => {
    await addAllGymItems(page);

    const firstItem = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await firstItem.getByLabel('Toggle Todo').click();

    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(todoItems(page)).toHaveCount(1);
    await expect(page.getByText('Warm up - 10 min treadmill')).toBeVisible();
  });

  test('TC-009: "Clear completed" removes all completed items', async ({ page }) => {
    await addAllGymItems(page);

    const firstItem = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await firstItem.getByLabel('Toggle Todo').click();

    await expect(page.getByText('4 items left')).toBeVisible();
    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByText('Warm up - 10 min treadmill')).not.toBeVisible();
    await expect(todoItems(page)).toHaveCount(4);
    await expect(page.getByText('4 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).not.toBeVisible();
  });

  test('TC-010: User can uncheck a completed item to reactivate it', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');

    const item = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await item.getByLabel('Toggle Todo').click();
    await expect(page.getByText('0 items left')).toBeVisible();

    await item.getByLabel('Toggle Todo').click();
    await expect(item.getByLabel('Toggle Todo')).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-011: User can edit a todo item by double-clicking', async ({ page }) => {
    await addTodo(page, 'Warm up - 10 min treadmill');

    const item = todoItems(page).filter({ hasText: 'Warm up - 10 min treadmill' });
    await item.getByText('Warm up - 10 min treadmill').dblclick();

    const editInput = item.getByRole('textbox');
    await editInput.fill('Updated gym exercise');
    await editInput.press('Enter');

    await expect(page.getByText('Updated gym exercise')).toBeVisible();
    await expect(page.getByText('Warm up - 10 min treadmill')).not.toBeVisible();
  });

  test('TC-012: "Mark all as complete" toggles all items to completed', async ({ page }) => {
    await addAllGymItems(page);

    await page.getByLabel('Mark all as complete').click();

    const items = todoItems(page);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).toHaveClass(/completed/);
    }

    await expect(page.getByText('0 items left')).toBeVisible();
  });
});
