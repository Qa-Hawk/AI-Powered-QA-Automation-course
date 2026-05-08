# Edge Cases — TodoMVC: Monday Gym Training List

## Application Under Test
- **URL:** https://demo.playwright.dev/todomvc/#/
- **Framework:** React • TodoMVC

---

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
