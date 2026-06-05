## Positive flows

### TC-001 — Program creation form is accessible from Programs page
- **Preconditions**
  - Admin user account exists
  - Admin user is logged in
- **Steps**
  1. Navigate to the **Programs** page.
  2. Click **+ New Program**.
- **Expected result**
  - The **program creation form** opens and shows fields:
    - **Program Name**
    - **Description**
- **Priority**: High

### TC-002 — Program is created successfully and appears in the program list
- **Preconditions**
  - Admin user is logged in
  - Programs page is accessible
- **Steps**
  1. Navigate to the **Programs** page.
  2. Click **+ New Program**.
  3. In **Program Name**, enter `Web Development 2026`.
  4. In **Description**, enter `Full-stack web development program`.
  5. Click **Create**.
- **Expected result**
  - The creation modal closes.
  - The program list shows `Web Development 2026`.
- **Priority**: High

### TC-003 — Create button becomes enabled when Program Name is populated
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. Enter `Web Development 2026` in **Program Name**.
  2. Leave **Description** empty.
- **Expected result**
  - **Create** is enabled (since Program Name is present).
- **Priority**: High

### TC-004 — Description supports typical punctuation and saves as entered
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. In **Program Name**, enter `Web Development 2026`.
  2. In **Description**, enter `Full-stack web development program (HTML/CSS/JS + APIs).`
  3. Click **Create**.
- **Expected result**
  - Modal closes.
  - The program list shows `Web Development 2026` (and no UI errors occur due to punctuation).
- **Priority**: Medium

---

## Negative flows

### TC-005 — Create is disabled when Program Name is empty (blank)
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. Leave **Program Name** empty.
- **Expected result**
  - **Create** button is disabled.
- **Priority**: High

### TC-006 — Create is disabled when Program Name contains only whitespace
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. In **Program Name**, enter `   ` (three spaces).
  2. Click outside the field (blur).
- **Expected result**
  - **Create** remains disabled (whitespace-only is treated as empty).
- **Priority**: High

### TC-007 — Non-admin user cannot create a new program
- **Preconditions**
  - Non-admin user account exists
  - Non-admin user is logged in
- **Steps**
  1. Navigate to the **Programs** page.
  2. Observe whether **+ New Program** is visible/clickable.
  3. If visible, attempt to open the creation form and create `Web Development 2026`.
- **Expected result**
  - **+ New Program** is not visible/enabled **or**
  - Attempt is blocked with an authorization error; program is **not** created.
- **Priority**: High

### TC-008 — Failed create does not close the modal or add the program (server error)
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
  - Backend is forced to return an error on create (e.g., 500) or network is interrupted
- **Steps**
  1. Enter **Program Name** = `Web Development 2026`.
  2. Enter **Description** = `Full-stack web development program`.
  3. Click **Create**.
- **Expected result**
  - Modal does **not** close on failure.
  - Program list does **not** show `Web Development 2026`.
  - A user-visible error state/message is shown (and user can retry).
- **Priority**: High

### TC-009 — Double-clicking Create does not create duplicate programs
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. Enter **Program Name** = `Web Development 2026`.
  2. Enter **Description** = `Full-stack web development program`.
  3. Double-click **Create** quickly (or click repeatedly).
- **Expected result**
  - Only **one** program `Web Development 2026` is created.
  - UI prevents duplicate submissions (e.g., disables Create while saving).
- **Priority**: High

---

## Edge cases

### TC-010 — Program Name accepts common special characters safely
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. In **Program Name**, enter `Web Development: Full-Stack (2026)`.
  2. In **Description**, enter `Full-stack web development program`.
  3. Click **Create**.
- **Expected result**
  - Modal closes.
  - Program list shows `Web Development: Full-Stack (2026)` exactly (no truncation/garbling).
- **Priority**: Medium

### TC-011 — Program Name handles Unicode characters
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. In **Program Name**, enter `Desarrollo Web 2026 — Avanzado`.
  2. In **Description**, enter `Full-stack web development program`.
  3. Click **Create**.
- **Expected result**
  - Program is created and displayed correctly with Unicode characters.
- **Priority**: Medium

### TC-012 — Program Name trims leading/trailing spaces
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. In **Program Name**, enter `  Web Development 2026  `.
  2. In **Description**, enter `Full-stack web development program`.
  3. Click **Create**.
- **Expected result**
  - Created program appears as `Web Development 2026` (without extra leading/trailing spaces) **or** the UI clearly preserves spaces (but does so consistently everywhere).
- **Priority**: Medium

### TC-013 — Description can be empty and still allows creation (if optional)
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
- **Steps**
  1. In **Program Name**, enter `Web Development 2026`.
  2. Leave **Description** empty.
  3. Click **Create**.
- **Expected result**
  - If **Description** is optional: modal closes and program is created.
  - If **Description** is required: Create is disabled or validation message is shown (but this requirement is not stated in ACs).
- **Priority**: Medium

### TC-014 — Max-length: Program Name at maximum allowed length is accepted
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
  - Maximum length for **Program Name** is known/configured
- **Steps**
  1. Enter a **Program Name** string exactly at max length (e.g., 255 characters if that is the limit).
  2. Enter **Description** = `Full-stack web development program`.
  3. Click **Create**.
- **Expected result**
  - Program is created successfully and displayed without UI breaking.
- **Priority**: Medium

### TC-015 — Max-length: Program Name over maximum is blocked gracefully
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
  - Maximum length for **Program Name** is known/configured
- **Steps**
  1. Attempt to paste a **Program Name** exceeding the limit (e.g., 256+ characters if limit is 255).
- **Expected result**
  - Input is prevented from exceeding the limit **or** validation is shown.
  - Program cannot be created with an over-limit name.
- **Priority**: Medium

### TC-016 — Max-length: Description at maximum allowed length is accepted
- **Preconditions**
  - Admin user is logged in
  - Program creation form is open
  - Maximum length for **Description** is known/configured
- **Steps**
  1. Enter **Program Name** = `Web Development 2026`.
  2. Enter a **Description** exactly at max length.
  3. Click **Create**.
- **Expected result**
  - Program is created; modal closes; UI remains responsive.
- **Priority**: Low

### TC-017 — Duplicate name: creating an already-existing program name is handled correctly
- **Preconditions**
  - Admin user is logged in
  - A program named `Web Development 2026` already exists in the list
  - Program creation form is open
- **Steps**
  1. Enter **Program Name** = `Web Development 2026`.
  2. Enter **Description** = `Full-stack web development program`.
  3. Click **Create**.
- **Expected result**
  - System either:
    - blocks duplicates with a clear validation error and does not create a second entry, **or**
    - allows duplicates intentionally (but then list display must disambiguate reliably).
- **Priority**: High

### TC-018 — Program list updates correctly after create (ordering/visibility)
- **Preconditions**
  - Admin user is logged in
  - Programs page has enough items to require scrolling or pagination (if applicable)
- **Steps**
  1. Create `Web Development 2026` via **+ New Program**.
- **Expected result**
  - `Web Development 2026` is visible in the list without requiring an unexpected manual refresh.
  - Ordering matches product rules (e.g., newest on top, alphabetical), and does not “lose” the new item.
- **Priority**: Medium

---

## Ambiguities / gaps in the Acceptance Criteria

- **Form type**: AC mentions “modal closes” but doesn’t explicitly say the creation form is a modal (vs page). Define expected behavior for close/cancel.
- **Field requirements**: Only Program Name validation is specified. Is **Description** optional or required? Any min/max lengths?
- **Duplicate handling**: No rule for duplicate **Program Name** (case sensitivity, whitespace trimming, uniqueness scope).
- **Error handling**: No expected UX for API/network failures (messages, retry, whether Create disables/spinner).
- **Permissions**: Non-admin behavior is not specified (button hidden vs disabled vs server-side rejection).
- **Sanitization/security**: No expectation for HTML/script injection handling in fields.
- **List refresh**: No explicit requirement for sorting, placement, pagination behavior, or whether a page refresh is required.

