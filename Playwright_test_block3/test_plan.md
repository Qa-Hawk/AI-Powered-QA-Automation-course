# Test Plan — TodoMVC: Monday Gym Training List

## Application Under Test
- **URL:** https://demo.playwright.dev/todomvc/#/
- **Framework:** React • TodoMVC
- **Date:** 2026-05-08
- **Author:** Senior QA Engineer

---

## Acceptance Criteria Summary

| AC# | Description |
|-----|-------------|
| AC-1 | Create a todo list for Monday training in gym |
| AC-2 | Add 5 items to the list |
| AC-3 | Finish (complete) an item — expect it to be marked as finished |
| AC-4 | Remove one item from the list — expect it to be removed |

---

## Positive Flows

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

---

## Negative Flows

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

---

## Edge Cases

### TC-018 — Special characters are preserved in todo text
- **Preconditions:** TodoMVC app is open with an empty list
- **Steps:**
  1. Type `Gym: legs & arms <today> "heavy" @Monday!` in the input field
  2. Press Enter
- **Expected Result:** The item is created with the exact text including all special characters `& < > " @  !`.
- **Priority:** Medium

### TC-019 — Duplicate todo items are allowed
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Type "Squats - 4 sets x 12 reps" and press Enter
  2. Type "Squats - 4 sets x 12 reps" and press Enter
- **Expected Result:** Two separate items with the same text appear in the list. Each can be independently toggled or deleted.
- **Priority:** Low

### TC-020 — Very long todo text is handled gracefully
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Type a string of 500+ characters in the input field
  2. Press Enter
- **Expected Result:** The item is created and displayed. The text does not break the layout (it may truncate visually or wrap, but remains functional). The item can be toggled and deleted.
- **Priority:** Low

### TC-021 — Rapid successive additions are all persisted
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Quickly add 10 items one after another by typing and pressing Enter rapidly
- **Expected Result:** All 10 items are created and appear in the correct order. The items-left counter shows "10 items left".
- **Priority:** Low

### TC-022 — Page refresh persists todo items (localStorage)
- **Preconditions:** Several items exist in the list (some active, some completed)
- **Steps:**
  1. Note the current list state
  2. Refresh the page (F5)
- **Expected Result:** All items are restored with their correct active/completed state. The items-left counter is accurate.
- **Priority:** High

### TC-023 — Single-character todo item is accepted
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Type "A" in the input field
  2. Press Enter
- **Expected Result:** A single-character item "A" is added to the list.
- **Priority:** Low

### TC-024 — Leading and trailing whitespace is trimmed
- **Preconditions:** TodoMVC app is open
- **Steps:**
  1. Type "   Bench press   " (with leading/trailing spaces) in the input field
  2. Press Enter
- **Expected Result:** The item is created with trimmed text "Bench press".
- **Priority:** Medium

### TC-025 — Completing and deleting the last remaining item
- **Preconditions:** Only one item exists in the list
- **Steps:**
  1. Hover over the item
  2. Click the "×" Delete button
- **Expected Result:** The item is removed. The list section and footer disappear (no items, no counter). Only the input field remains.
- **Priority:** Medium

### TC-026 — Mark all as complete, then unmark all
- **Preconditions:** Multiple active items exist
- **Steps:**
  1. Click "❯Mark all as complete" to complete all items
  2. Click "❯Mark all as complete" again to uncheck all items
- **Expected Result:** First click: all items become completed, counter shows "0 items left". Second click: all items return to active, counter shows the total count.
- **Priority:** Low

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **"Create to do list for Monday training in gym"** — The AC says "create a list" but does not specify a list name or title. TodoMVC does not support named lists; it has a single unnamed list. The AC was interpreted as "add gym-training-related items."

2. **"Add 5 items"** — The specific item texts are not defined in the ACs. This test plan uses realistic gym training exercises. The AC does not specify whether items should be unique or can be duplicates.

3. **"Finish item. Expect to be finished"** — The AC does not specify *which* item to finish, or how "finished" should look (strikethrough, checked, moved to completed filter). This plan assumes toggling the checkbox marks an item as finished.

4. **"Remove one item from the list"** — The AC does not specify *which* item to remove, or whether it should be an active or completed item. This plan tests removing an active item. It also does not clarify whether "remove" means using the × button or the "Clear completed" function.

5. **Persistence** — The ACs do not mention whether data should survive a page reload. TodoMVC typically uses localStorage, but this is not explicitly required.

6. **Edit functionality** — The ACs do not mention editing existing items, but the app supports double-click-to-edit. This is covered as an additional test case.

7. **Filters (All / Active / Completed)** — Not mentioned in the ACs but are core features of TodoMVC that should be tested.

8. **Item ordering** — The ACs do not specify expected item order (FIFO assumed).

9. **Concurrency / multiple tabs** — The ACs do not address behavior when the same list is opened in multiple browser tabs.
