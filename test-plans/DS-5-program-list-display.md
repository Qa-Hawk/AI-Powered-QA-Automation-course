## Program list filtering and display — Test Plan (Admin)

### Scope
Validate the Programs page list display and “no programs” empty state, plus common admin list-management expectations (rendering, data integrity, basic filtering behaviors, accessibility, and resiliency).

### Test data (used across cases)
- Program A
  - **Name**: `Youth Leadership 2026`
  - **Description**: `A 12-week leadership program for high school students.`
- Program B
  - **Name**: `STEM Scholars`
  - **Description**: `Scholarships and mentoring for first-generation STEM majors.`
- Program C (special characters)
  - **Name**: `Café & Résumé Prep`
  - **Description**: `Career support: CV review, mock interviews, and networking.`
- Program D (duplicate name)
  - **Name**: `STEM Scholars`
  - **Description**: `Evening cohort for working students.`
- Program E (max-length boundary, if supported)
  - **Name**: `A` repeated to the system’s max allowed characters
  - **Description**: `B` repeated to the system’s max allowed characters

---

## Positive flows

### TC-001 — Programs page shows each program’s name and description
- **Preconditions**
  - Admin user is logged in.
  - Programs exist: `Youth Leadership 2026`, `STEM Scholars`.
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - A list is visible.
  - Each list row/card shows **Name** and **Description** for both programs:
    - `Youth Leadership 2026` with `A 12-week leadership program for high school students.`
    - `STEM Scholars` with `Scholarships and mentoring for first-generation STEM majors.`
  - No “no programs created” empty-state message is shown.
- **Priority**: High

### TC-002 — Programs page supports scanning: consistent alignment and readable wrapping
- **Preconditions**
  - Admin user is logged in.
  - Programs exist: Program A, Program B, Program C.
- **Steps**
  1. Navigate to **Programs** page.
  2. Visually inspect the list layout for 3+ items.
- **Expected result**
  - Names and descriptions are clearly separated (e.g., distinct typography or fields).
  - Long descriptions wrap (or are truncated with a clear affordance) without overlapping other rows.
  - Special characters render correctly (e.g., `Café & Résumé Prep`).
- **Priority**: Medium

### TC-003 — Empty state shown when there are no programs
- **Preconditions**
  - Admin user is logged in.
  - No programs exist in the system.
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - Message indicates no programs have been created (e.g., “No programs have been created yet.”).
  - A prompt to create the first program is visible (e.g., button/link such as **Create program**).
  - No empty list/table chrome is misleadingly shown as “data present.”
- **Priority**: High

### TC-004 — Empty state “create first program” prompt routes correctly
- **Preconditions**
  - Admin user is logged in.
  - No programs exist.
- **Steps**
  1. Navigate to **Programs** page.
  2. Click the empty-state prompt **Create program**.
- **Expected result**
  - User is taken to the program creation flow (or modal) without errors.
- **Priority**: Medium

---

## Negative flows

### TC-005 — Non-admin user cannot access Programs management list (authorization)
- **Preconditions**
  - Non-admin user is logged in.
- **Steps**
  1. Attempt to navigate to **Programs** page (via menu or direct URL).
- **Expected result**
  - Access is denied (e.g., “Not authorized”) or the page is hidden from navigation.
  - Program names/descriptions are not exposed to unauthorized users.
- **Priority**: High

### TC-006 — Programs page does not show “no programs” empty state when programs exist
- **Preconditions**
  - Admin user is logged in.
  - Programs exist: Program A.
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - Empty state message and “Create the first program” prompt are not shown.
- **Priority**: High

### TC-007 — Programs page handles server error without showing stale/incorrect data
- **Preconditions**
  - Admin user is logged in.
  - Backend API for programs list returns **500** (or network failure).
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - A clear error state is shown (e.g., “Unable to load programs. Try again.”).
  - The UI does not incorrectly display the “no programs created” empty state if the failure is not a true empty result.
  - No partial/corrupted program rows render.
- **Priority**: High

### TC-008 — Programs page prevents script injection via program fields (XSS)
- **Preconditions**
  - Admin user is logged in.
  - A program exists with:
    - **Name**: `<script>alert(1)</script>`
    - **Description**: `Normal description`
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - The string is displayed as text (escaped), not executed.
  - No alert executes; no DOM injection occurs.
- **Priority**: High

---

## Edge cases

### TC-009 — Duplicate program names both appear as separate list entries
- **Preconditions**
  - Admin user is logged in.
  - Programs exist: Program B and Program D (both named `STEM Scholars`).
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - Two separate entries are visible.
  - Each entry shows its own description correctly (no merging or overwriting).
- **Priority**: High

### TC-010 — Special characters and diacritics render correctly
- **Preconditions**
  - Admin user is logged in.
  - Program C exists.
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - Name `Café & Résumé Prep` displays with correct diacritics.
  - Description punctuation (colon, commas) displays correctly.
- **Priority**: Medium

### TC-011 — Leading/trailing whitespace does not break display or sorting/scanability
- **Preconditions**
  - Admin user is logged in.
  - A program exists with:
    - **Name**: `  Community Outreach  `
    - **Description**: `  Weekend volunteering program.  `
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - UI displays trimmed/normalized text (no awkward indentation or blank-looking rows).
  - The row remains clickable/readable and consistent with others.
- **Priority**: Low

### TC-012 — Null/empty description is handled gracefully
- **Preconditions**
  - Admin user is logged in.
  - A program exists with:
    - **Name**: `Adult Literacy`
    - **Description**: empty string (or null, if allowed by backend)
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - Program still appears in the list.
  - Description area shows a sensible fallback (e.g., blank but aligned, or “No description provided”) without breaking layout.
- **Priority**: Medium

### TC-013 — Very long name and description do not break the page layout (max-length boundary)
- **Preconditions**
  - Admin user is logged in.
  - Program E exists (max allowed lengths).
- **Steps**
  1. Navigate to **Programs** page.
  2. Observe rendering on common viewport widths (desktop; if responsive, include narrower width).
- **Expected result**
  - No overlapping text, broken rows, or horizontal scroll traps (unless intentionally designed).
  - Content is readable via wrapping/truncation rules consistently applied.
- **Priority**: Medium

### TC-014 — Large number of programs still results in a usable list (performance boundary)
- **Preconditions**
  - Admin user is logged in.
  - 200+ programs exist (including a mix of short/long descriptions).
- **Steps**
  1. Navigate to **Programs** page.
  2. Scroll through the list.
- **Expected result**
  - Page loads within acceptable time for the environment (no freezing).
  - Scrolling remains responsive; rows do not visually “jump” or duplicate.
- **Priority**: Medium

### TC-015 — Empty state message is specific and action-oriented
- **Preconditions**
  - Admin user is logged in.
  - No programs exist.
- **Steps**
  1. Navigate to **Programs** page.
- **Expected result**
  - Message indicates absence of programs (not a generic error).
  - Prompt clearly suggests the next step (create first program) and is visible without scrolling.
- **Priority**: Low

---

## Ambiguities / gaps in the Acceptance Criteria
- **Filtering is not specified**: The story mentions “filtering,” but ACs only cover list display and empty state. No requirements for search box, status filters, sorting, pagination, or default ordering.
- **Field constraints unknown**: Max lengths, whether description is optional, and allowed character sets are not defined (affects boundary tests like TC-012/TC-013).
- **Error/loading states unspecified**: ACs don’t define what to show during loading, network failures, or partial failures (TC-007).
- **Permissions scope unclear**: The story says “admin user,” but doesn’t explicitly define behavior for non-admin users (TC-005).
- **Exact empty-state copy and CTA behavior**: ACs require a “message” and a “prompt,” but don’t define exact text, button label, or destination flow (TC-003/TC-004/TC-015).
