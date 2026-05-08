# Negative Flows — TodoMVC: Monday Gym Training List

## Application Under Test
- **URL:** https://demo.playwright.dev/todomvc/#/
- **Framework:** React • TodoMVC

---

### TC-013 — Empty input does not create a todo item
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Click the "What needs to be done?" input field
  2. Press Enter without typing any text
- **Expected Result:** No new item is added to the list. The list remains unchanged.
- **Priority:** High

### TC-014 — Whitespace-only input does not create a todo item
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Type "     " (multiple spaces) in the input field
  2. Press Enter
- **Expected Result:** No new item is added. The input field is cleared or trimmed.
- **Priority:** High

### TC-015 — Deleting a completed item does not affect active items
- **Preconditions:** List has both active and completed items
- **Steps:**
  1. Hover over a completed item
  2. Click the "×" Delete button
- **Expected Result:** Only the completed item is removed. All active items remain. The items-left counter does not change.
- **Priority:** Medium

### TC-016 — Editing a todo to empty text removes or rejects the item
- **Preconditions:** At least one item exists
- **Steps:**
  1. Double-click the item text to enter edit mode
  2. Clear all text
  3. Press Enter
- **Expected Result:** The item is removed from the list (TodoMVC standard behavior: saving an empty edit deletes the item).
- **Priority:** Medium

### TC-017 — Pressing Escape during edit cancels the change
- **Preconditions:** At least one item exists
- **Steps:**
  1. Double-click the item text to enter edit mode
  2. Modify the text
  3. Press Escape
- **Expected Result:** The item text reverts to its original value. Edit mode is exited.
- **Priority:** Medium
