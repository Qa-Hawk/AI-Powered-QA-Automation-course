Goal: verify an admin can delete a program **only after confirming**, and that canceling keeps it intact. I’ll cover both acceptance criteria plus negative and edge scenarios (duplicates, special chars, max-length, permissions, failures, concurrency).

## Positive flows

### TC-001 — Program is deleted after confirmation
- **Preconditions**
  - Logged in as **Admin** user
  - Program list contains a program named **“Test Program”**
- **Steps**
  1. Open **Programs** list page.
  2. Locate **“Test Program”** row.
  3. Click the **Delete (trash) icon** for **“Test Program”**.
  4. In the confirmation dialog, click **Confirm**.
- **Expected result**
  - Confirmation dialog closes
  - **“Test Program”** is **removed** from the program list
  - A success notification is shown (if notifications exist)
- **Priority**: High

### TC-002 — Confirmation dialog appears when delete icon is clicked
- **Preconditions**
  - Logged in as **Admin** user
  - Program list contains **“Test Program”**
- **Steps**
  1. Open **Programs** list page.
  2. Click the **Delete (trash) icon** for **“Test Program”**.
- **Expected result**
  - A **confirmation dialog** appears
  - Dialog clearly references **“Test Program”** (name shown in message/title)
  - Dialog provides at least **Confirm** and **Cancel** actions
- **Priority**: High

### TC-003 — Cancel keeps the program in the list
- **Preconditions**
  - Logged in as **Admin** user
  - Program list contains **“Test Program”**
- **Steps**
  1. Open **Programs** list page.
  2. Click the **Delete (trash) icon** for **“Test Program”**.
  3. In the confirmation dialog, click **Cancel**.
- **Expected result**
  - Dialog closes
  - **“Test Program”** still appears in the program list (same row still present)
  - No “deleted” success message is shown
- **Priority**: High

### TC-004 — Dismiss dialog via close (X) or outside click behaves like Cancel (if supported)
- **Preconditions**
  - Logged in as **Admin** user
  - Program list contains **“Test Program”**
- **Steps**
  1. Click the **Delete** icon for **“Test Program”**.
  2. Dismiss the dialog using **X** (or click outside modal, if supported).
- **Expected result**
  - **“Test Program”** remains in the list
  - No deletion request is triggered
- **Priority**: Medium

## Negative flows

### TC-005 — Deletion must not occur without explicit confirmation
- **Preconditions**
  - Logged in as **Admin** user
  - Program list contains **“Test Program”**
- **Steps**
  1. Click the **Delete** icon for **“Test Program”**.
  2. Do **not** click Confirm (wait 10 seconds).
- **Expected result**
  - Program is **not** removed
  - Dialog remains until user action (or times out only if specified)
- **Priority**: High

### TC-006 — Non-admin user cannot delete a program
- **Preconditions**
  - Logged in as **Standard user** (non-admin)
  - Program list contains **“Test Program”**
- **Steps**
  1. Open **Programs** list page.
  2. Observe whether a **Delete icon** is present.
  3. If present, attempt to click Delete and confirm.
- **Expected result**
  - Delete icon is **not visible** OR delete action is **blocked**
  - No program is removed
  - If attempted, user sees an authorization error (e.g., “You don’t have permission”)
- **Priority**: High

### TC-007 — Server/API failure does not remove program from the list
- **Preconditions**
  - Logged in as **Admin**
  - Program list contains **“Test Program”**
  - Simulate delete API returning **500** or network failure
- **Steps**
  1. Click Delete for **“Test Program”**.
  2. Click **Confirm**.
- **Expected result**
  - **“Test Program”** remains in the list (or is restored if UI optimistically removed it)
  - Error message is shown (e.g., “Delete failed. Please try again.”)
  - No “successfully deleted” message is shown
- **Priority**: High

### TC-008 — Double-click Confirm does not delete multiple items / does not error
- **Preconditions**
  - Logged in as **Admin**
  - Program list contains **“Test Program”**
- **Steps**
  1. Click Delete for **“Test Program”**.
  2. Double-click **Confirm** quickly.
- **Expected result**
  - Only one deletion occurs
  - UI prevents duplicate submissions (Confirm disabled/spinner) or backend is idempotent
  - No duplicate errors/toasts
- **Priority**: Medium

### TC-009 — Wrong item must not be deleted after sorting/filtering changes
- **Preconditions**
  - Logged in as **Admin**
  - Programs list contains at least: **“Test Program”**, **“Test Program 2”**
- **Steps**
  1. Click Delete for **“Test Program”** to open confirmation dialog.
  2. Without confirming, change list state if possible (sort by Name, apply filter, paginate).
  3. Click **Confirm** in the dialog.
- **Expected result**
  - Only **“Test Program”** is deleted (the item referenced in the dialog)
  - No other program is removed
- **Priority**: High

### TC-010 — If program was already deleted elsewhere, UI handles gracefully
- **Preconditions**
  - Logged in as **Admin**
  - Program list shows **“Test Program”**
  - Another admin deletes **“Test Program”** in a different session before confirmation
- **Steps**
  1. Click Delete for **“Test Program”**.
  2. Click **Confirm**.
- **Expected result**
  - UI shows a friendly message (e.g., “Program no longer exists”)
  - List refreshes and does not show **“Test Program”**
  - No crash/uncaught error
- **Priority**: Medium

## Edge cases

### TC-011 — Duplicate program names: correct instance is deleted
- **Preconditions**
  - Logged in as **Admin**
  - Two programs exist with the same name **“Test Program”** (different IDs/created dates)
- **Steps**
  1. In the list, identify the first **“Test Program”** row (e.g., by Created date column).
  2. Click Delete for that specific row.
  3. Confirm deletion.
- **Expected result**
  - Only the selected row/program instance is removed
  - The other **“Test Program”** remains
  - Confirmation dialog identifies the correct target (name plus unique detail if available)
- **Priority**: High

### TC-012 — Special characters in name are displayed correctly in dialog and deletion works
- **Preconditions**
  - Logged in as **Admin**
  - Program exists named **`QA & Security: O'Reilly <Test> / \"Program\" #1`**
- **Steps**
  1. Click Delete for **`QA & Security: O'Reilly <Test> / \"Program\" #1`**.
  2. Confirm deletion.
- **Expected result**
  - Confirmation dialog text renders safely (no HTML injection, no broken layout)
  - Program is removed from the list after confirmation
- **Priority**: High

### TC-013 — Max-length name program can be deleted (boundary)
- **Preconditions**
  - Logged in as **Admin**
  - Program exists with a very long name (e.g., **255 characters** if that’s the system limit), such as:
    - `Program-` repeated until length 255
- **Steps**
  1. Locate the long-name program (may require horizontal scroll / tooltip).
  2. Click Delete and confirm.
- **Expected result**
  - Confirmation dialog still usable (name truncated gracefully if needed)
  - Correct program is deleted
- **Priority**: Medium

### TC-014 — Empty list state after deletion is correct
- **Preconditions**
  - Logged in as **Admin**
  - Only one program exists: **“Test Program”**
- **Steps**
  1. Delete **“Test Program”** and confirm.
- **Expected result**
  - List shows an empty state message (e.g., “No programs found”) if applicable
  - No stale row remains
- **Priority**: Medium

### TC-015 — Pagination boundary: deleting last item on last page updates pagination correctly
- **Preconditions**
  - Logged in as **Admin**
  - Enough programs to have multiple pages; last page contains exactly one program: **“Test Program”**
- **Steps**
  1. Navigate to the last page.
  2. Delete **“Test Program”** and confirm.
- **Expected result**
  - User is navigated to a valid page (previous page if last becomes empty)
  - No pagination errors (no blank page with invalid index)
- **Priority**: Medium

### TC-016 — Keyboard accessibility: Esc cancels, Enter confirms (if supported)
- **Preconditions**
  - Logged in as **Admin**
  - Program exists: **“Test Program”**
- **Steps**
  1. Click Delete for **“Test Program”** to open dialog.
  2. Press **Esc**.
  3. Open dialog again; press **Enter** (with Confirm focused).
- **Expected result**
  - Esc dismisses dialog and program remains
  - Enter triggers confirmation and program is removed
  - Focus is trapped within dialog while open (no interaction with list behind)
- **Priority**: Low (unless accessibility is a key requirement)

## Ambiguities / gaps in the acceptance criteria
- **Dialog specifics**: text content, whether it must include the program name, and whether it supports dismiss via **X/outside click/Esc**.
- **Authorization**: whether non-admins can see the delete icon, and expected error handling if they try.
- **Duplicates**: whether program names are unique; if not, how the UI differentiates them in the confirmation.
- **Failure handling**: required behavior on network/API errors (retry, toast, rollback if optimistic UI).
- **Pagination/sorting/filtering**: expected behavior if list state changes while dialog is open.
- **Accessibility requirements**: keyboard interaction, focus management, screen reader labels/roles.
