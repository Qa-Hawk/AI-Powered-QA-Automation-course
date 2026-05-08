# Positive Flows — TodoMVC: Monday Gym Training List

## Application Under Test
- **URL:** https://demo.playwright.dev/todomvc/#/
- **Framework:** React • TodoMVC

---

### TC-001 — User can create a new todo item
- **Preconditions:** TodoMVC app is open at `https://demo.playwright.dev/todomvc/#/` with an empty list
- **Steps:**
  1. Click the "What needs to be done?" input field
  2. Type "Warm up - 10 min treadmill"
  3. Press Enter
- **Expected Result:** The item "Warm up - 10 min treadmill" appears in the todo list. The items-left counter displays "1 item left".
- **Priority:** High

### TC-002 — User can add 5 items to the todo list
- **Preconditions:** TodoMVC app is open with an empty list
- **Steps:**
  1. Type "Warm up - 10 min treadmill" and press Enter
  2. Type "Bench press - 4 sets x 10 reps" and press Enter
  3. Type "Squats - 4 sets x 12 reps" and press Enter
  4. Type "Deadlifts - 3 sets x 8 reps" and press Enter
  5. Type "Cool down - stretching 10 min" and press Enter
- **Expected Result:** All 5 items appear in the list in the order they were entered. The counter shows "5 items left".
- **Priority:** High

### TC-003 — Completed item shows visual strikethrough and checked state
- **Preconditions:** At least one todo item exists in the list (e.g., "Warm up - 10 min treadmill")
- **Steps:**
  1. Click the circle/checkbox (Toggle Todo) to the left of "Warm up - 10 min treadmill"
- **Expected Result:** The checkbox becomes checked. The item text gets a strikethrough style. The items-left counter decreases by 1. A "Clear completed" button appears in the footer.
- **Priority:** High

### TC-004 — Removed item disappears from the list
- **Preconditions:** At least two todo items exist in the list
- **Steps:**
  1. Hover over the item "Deadlifts - 3 sets x 8 reps"
  2. Click the "×" (Delete) button that appears on the right
- **Expected Result:** "Deadlifts - 3 sets x 8 reps" is no longer in the list. The items-left counter decreases by 1. The remaining items maintain their order.
- **Priority:** High

### TC-005 — Items-left counter reflects only active (uncompleted) items
- **Preconditions:** 5 items exist; 1 is marked as completed
- **Steps:**
  1. Observe the footer counter
- **Expected Result:** The counter shows "4 items left" (excludes the completed item).
- **Priority:** High

### TC-006 — "All" filter shows both active and completed items
- **Preconditions:** List contains both active and completed items
- **Steps:**
  1. Click the "All" link in the footer
- **Expected Result:** All items (active and completed) are visible. Completed items display with strikethrough styling.
- **Priority:** Medium

### TC-007 — "Active" filter shows only uncompleted items
- **Preconditions:** List contains both active and completed items
- **Steps:**
  1. Click the "Active" link in the footer
- **Expected Result:** Only uncompleted items are displayed. Completed items are hidden.
- **Priority:** Medium

### TC-008 — "Completed" filter shows only finished items
- **Preconditions:** List contains both active and completed items
- **Steps:**
  1. Click the "Completed" link in the footer
- **Expected Result:** Only completed (checked) items are shown. Active items are hidden.
- **Priority:** Medium

### TC-009 — "Clear completed" removes all completed items
- **Preconditions:** At least one item is marked as completed
- **Steps:**
  1. Click the "Clear completed" button in the footer
- **Expected Result:** All completed items are removed from the list. The "Clear completed" button disappears. The items-left counter remains unchanged (it only counted active items).
- **Priority:** Medium

### TC-010 — User can uncheck a completed item to reactivate it
- **Preconditions:** An item is marked as completed
- **Steps:**
  1. Click the checked toggle checkbox on the completed item
- **Expected Result:** The item returns to active state (strikethrough removed, checkbox unchecked). The items-left counter increases by 1.
- **Priority:** Medium

### TC-011 — User can edit a todo item by double-clicking
- **Preconditions:** At least one todo item exists
- **Steps:**
  1. Double-click the text of an existing todo item
  2. Clear the current text and type "Updated gym exercise"
  3. Press Enter
- **Expected Result:** The item text updates to "Updated gym exercise".
- **Priority:** Medium

### TC-012 — "Mark all as complete" toggles all items to completed
- **Preconditions:** Multiple active items exist
- **Steps:**
  1. Click the "❯Mark all as complete" toggle (chevron/arrow)
- **Expected Result:** All items become checked/completed. The items-left counter shows "0 items left".
- **Priority:** Medium
