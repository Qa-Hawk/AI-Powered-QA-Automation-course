## Test Plan — Edit Existing Program Details (Admin)

### Assumptions / Context
- **Page**: Programs page lists programs in a table/list.
- **Edit entry point**: An **edit icon** (e.g., pencil) exists per program row.
- **Edit UI**: Editing opens a **modal** containing an **Edit Program** form.
- **Fields available** (based on AC + common program setup): **Name** (required), **Description** (optional unless stated), and possibly other fields (e.g., **Start Date**, **End Date**, **Status**, **Capacity**). Tests refer to **Name** and **Description** explicitly; other fields are referenced as “other fields” when validating preservation.
- **Save behavior**: Clicking **Save** persists changes, closes the modal on success, and the **Programs list updates immediately**.

---

## Positive flows

### TC-001 — Edit form opens pre-populated with current program data
- **Preconditions**
  - Logged in as **Admin** user.
  - On the **Programs** page.
  - A program named **“Web Development 2026”** exists with:
    - **Name**: Web Development 2026
    - **Description**: Full-stack web development program for 2026 cohort.
- **Steps**
  1. Locate **“Web Development 2026”** in the Programs list.
  2. Click the **edit icon** on the **“Web Development 2026”** row.
- **Expected result**
  - An **Edit Program** modal opens.
  - The form is **pre-populated** with the current data:
    - **Name** field shows **“Web Development 2026”**
    - **Description** field shows **“Full-stack web development program for 2026 cohort.”**
    - Any other visible fields match the program’s existing values.
- **Priority**: High

### TC-002 — Program name updates successfully and list reflects change immediately
- **Preconditions**
  - Editing modal is open for **“Web Development 2026”** (e.g., via TC-001).
- **Steps**
  1. In **Name**, change value to **“Web Development 2026 - Updated”**.
  2. Click **Save**.
- **Expected result**
  - Save succeeds.
  - The **modal closes**.
  - The Programs list **immediately** shows **“Web Development 2026 - Updated”** (same row/program updated, not duplicated).
- **Priority**: High

### TC-003 — Editing only Description preserves Name and other fields
- **Preconditions**
  - A program exists with:
    - **Name**: Web Development 2026
    - **Description**: Full-stack web development program for 2026 cohort.
  - Edit modal is open for this program.
- **Steps**
  1. Change **Description** to **“Updated description: includes React, Node.js, and CI/CD.”**
  2. Do **not** change **Name**.
  3. Click **Save**.
- **Expected result**
  - Save succeeds and modal closes.
  - Program row shows **Name remains “Web Development 2026”**.
  - Description is updated (either visible in list or visible when re-opening edit modal / viewing details).
  - Any other fields remain unchanged.
- **Priority**: High

### TC-004 — Re-open edit shows persisted changes after save
- **Preconditions**
  - A program was updated successfully (e.g., TC-002 or TC-003).
- **Steps**
  1. In the Programs list, click the **edit icon** for the same program.
- **Expected result**
  - Edit modal opens with fields **pre-populated with the newly saved values** (not the old values).
- **Priority**: Medium

---

## Negative flows

### TC-005 — Save blocked when Name is cleared (required field validation)
- **Preconditions**
  - Edit modal open for **“Web Development 2026”**.
- **Steps**
  1. Clear the **Name** field (leave it empty).
  2. Click **Save**.
- **Expected result**
  - Save is **not** completed.
  - Modal **remains open**.
  - A clear validation error is shown (e.g., **“Name is required.”**).
  - Program list remains unchanged.
- **Priority**: High

### TC-006 — Duplicate Name is rejected (uniqueness constraint)
- **Preconditions**
  - Program A exists: **“Web Development 2026”**
  - Program B exists: **“Data Science 2026”**
  - Edit modal open for **“Web Development 2026”**
- **Steps**
  1. Change **Name** to **“Data Science 2026”**.
  2. Click **Save**.
- **Expected result**
  - Save is **rejected** with a user-facing error (e.g., **“Program name already exists.”**).
  - Modal stays open (or closes but shows error—must be consistent and not lose user input).
  - Programs list does **not** show the duplicate rename.
- **Priority**: High

### TC-007 — Invalid input is not accepted (script injection attempt)
- **Preconditions**
  - Edit modal open for **“Web Development 2026”**.
- **Steps**
  1. Set **Name** to: `Web Dev <script>alert("x")</script> 2026`
  2. Click **Save**.
- **Expected result**
  - The application **does not execute** any script.
  - Input is either **rejected with validation** or **sanitized/escaped** on display.
  - Programs list remains safe (no HTML/script rendering).
- **Priority**: High

### TC-008 — System should not create a new program when editing
- **Preconditions**
  - Programs list count is known (note number of programs).
  - Edit modal open for **“Web Development 2026”**.
- **Steps**
  1. Change **Name** to **“Web Development 2026 - Updated”**.
  2. Click **Save**.
- **Expected result**
  - The existing program is updated **in place**.
  - **No additional program row** is added (program count unchanged).
- **Priority**: High

### TC-009 — Save failure shows error and does not update the list
- **Preconditions**
  - Edit modal open for a program.
  - Ability to simulate server error (e.g., API returns 500 / network interruption).
- **Steps**
  1. Change **Description** to **“Updated description: includes React, Node.js, and CI/CD.”**
  2. Click **Save** while simulating failure.
- **Expected result**
  - A clear error message is shown (e.g., **“Could not save changes. Try again.”**).
  - Modal remains open and user input is retained.
  - Programs list does **not** reflect the attempted change.
- **Priority**: High

### TC-010 — Cancel/Close does not persist changes
- **Preconditions**
  - Edit modal open for **“Web Development 2026”**.
- **Steps**
  1. Change **Name** to **“Web Development 2026 - Updated”**.
  2. Click **Cancel** (or close the modal via X if available).
  3. Re-open edit modal for the same program.
- **Expected result**
  - Modal closes without saving.
  - Program list still shows **“Web Development 2026”**.
  - Re-opened modal shows original values (changes discarded).
- **Priority**: Medium

---

## Edge cases

### TC-011 — Name max-length boundary is enforced (exact limit and over-limit)
- **Preconditions**
  - Edit modal open for a program.
  - Max length requirement is defined (if not, this test reveals a gap).
- **Steps**
  1. Enter a **Name** at the **maximum allowed length** (e.g., if 100 chars):  
     `Web Development Program 2026 Cohort - Advanced Full Stack Track - Weekday Evening`
  2. Click **Save**.
  3. Enter a **Name** that is **1 character over** the limit.
  4. Click **Save**.
- **Expected result**
  - Max-length value saves successfully.
  - Over-limit is blocked with validation (or input prevents typing beyond limit).
  - No truncation occurs silently (either explicit truncation behavior or rejection must be consistent).
- **Priority**: Medium

### TC-012 — Name supports common special characters without breaking UI/storage
- **Preconditions**
  - Edit modal open for a program.
- **Steps**
  1. Set **Name** to: `Web Development 2026 — Updated (C#/.NET + React) [Evening]`
  2. Click **Save**.
- **Expected result**
  - Save succeeds.
  - List displays the name correctly (no mojibake, no broken rendering).
- **Priority**: Medium

### TC-013 — Leading/trailing whitespace is handled consistently
- **Preconditions**
  - Edit modal open for a program.
- **Steps**
  1. Set **Name** to: `  Web Development 2026 - Updated  ` (two leading/trailing spaces).
  2. Click **Save**.
- **Expected result**
  - Name is **trimmed** and stored/displayed as `Web Development 2026 - Updated` **or** validation prompts user—behavior must be consistent.
  - No duplicate-by-whitespace issue (e.g., “Name already exists” should treat trimmed equivalently if uniqueness is enforced).
- **Priority**: Medium

### TC-014 — Description empty value behavior (clear description)
- **Preconditions**
  - Program has a non-empty Description.
  - Edit modal open for that program.
- **Steps**
  1. Clear **Description** (empty string).
  2. Click **Save**.
- **Expected result**
  - If Description is optional: save succeeds and Description becomes empty.
  - If Description is required: validation prevents save with clear error.
- **Priority**: Low

### TC-015 — Very long Description saves or validates (boundary)
- **Preconditions**
  - Edit modal open for a program.
- **Steps**
  1. Paste a long Description (e.g., 5,000+ characters) containing multiple paragraphs.
  2. Click **Save**.
- **Expected result**
  - If within limit: saves successfully with formatting preserved as expected.
  - If over limit: validation error shown; user input retained.
- **Priority**: Low

### TC-016 — Concurrent update detection (stale edit session)
- **Preconditions**
  - Admin A opens edit modal for **“Web Development 2026”**.
  - Admin B (or a second session) updates the same program’s Name to **“Web Development 2026 - Updated by B”** and saves.
- **Steps**
  1. In Admin A’s still-open modal, change **Description** only.
  2. Click **Save**.
- **Expected result**
  - System prevents unintentional overwrite (e.g., conflict message) **or** clearly defines last-write-wins behavior.
  - No silent data loss without warning (this test will surface behavior).
- **Priority**: Low

---

## Ambiguities / Gaps in the Acceptance Criteria
- **Field list**: Only Name/Description are implied; AC says “other fields” but doesn’t define which fields exist (dates, status, etc.) or which are required.
- **Validation rules**: No explicit requirements for **required fields**, **max lengths**, **allowed characters**, **trimming**, or **uniqueness** (case sensitivity, whitespace normalization).
- **“Immediately shows” definition**: Unclear whether list updates via optimistic UI, refetch, or manual refresh; also unclear whether sorting/filtering changes might move the row.
- **Error handling**: No specified behavior for API/network failures (modal close vs stay open, error placement, retry).
- **Concurrency**: No guidance for simultaneous edits (conflict handling vs last-write-wins).
- **Permissions**: Story says “admin user,” but no AC covers non-admin access or authorization failures (e.g., 403 on save).
