Goal: validate **program name trimming/emptiness**, allow **special characters**, and **prevent duplicates** to maintain data integrity. Next I’ll cover each acceptance criterion with at least one test case, then add negative and edge cases around trimming, length, characters, and duplication rules.

## Positive flows

### TC-001 — Program is created when name contains special characters
- **Preconditions**
  - Admin user is logged in
  - Program creation form is available
- **Steps**
  1. Navigate to **Programs → Create Program**
  2. In **Program Name**, enter `Informatique & IA - Niveau 2`
  3. Fill all other required fields with valid values (per form validation)
  4. Click **Create**
- **Expected result**
  - Form submits successfully
  - Program is created and appears in the programs list/details with name exactly `Informatique & IA - Niveau 2`
  - No validation error is shown for **Program Name**
- **Priority**: High

### TC-002 — Program is created when name has leading/trailing spaces but meaningful content
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Navigate to **Programs → Create Program**
  2. In **Program Name**, enter `  Web Development 2026  `
  3. Fill other required fields with valid values
  4. Click **Create**
- **Expected result**
  - Form submits successfully
  - Program is created
  - Saved/displayed name is **trimmed** to `Web Development 2026` (or the UI consistently displays trimmed value)
- **Priority**: High

### TC-003 — Program is created when name contains internal multiple spaces
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `Data   Science   Bootcamp` in **Program Name**
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Program is created successfully
  - Name is stored/displayed consistently (either preserves internal spacing or normalizes it—must not corrupt the name)
- **Priority**: Medium

## Negative flows

### TC-004 — Form is not submitted when program name is only whitespace (trimmed to empty)
- **Preconditions**
  - Admin user is logged in
  - On **Programs → Create Program**
- **Steps**
  1. In **Program Name**, enter `   `
  2. Fill other required fields with valid values
  3. Click **Create**
- **Expected result**
  - **Form is not submitted**
  - **Program Name** is treated as empty after trimming
  - Validation message is shown for **Program Name** (e.g., “Program Name is required”)
  - No program is created
- **Priority**: High

### TC-005 — Duplicate program name is rejected
- **Preconditions**
  - Admin user is logged in
  - A program named `Web Development 2026` already exists
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `Web Development 2026` in **Program Name**
  3. Fill other required fields with valid values
  4. Click **Create**
- **Expected result**
  - Form submission is blocked (client-side) or rejected (server-side)
  - Error is shown indicating **program name already exists**
  - No additional program is created with that name
- **Priority**: High

### TC-006 — Duplicate is rejected even if user adds leading/trailing spaces
- **Preconditions**
  - Program `Web Development 2026` exists
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `  Web Development 2026  ` in **Program Name**
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Duplicate is detected after trimming
  - Error indicates name already exists
  - No program is created
- **Priority**: High

### TC-007 — Duplicate is rejected when case differs (if comparison is case-insensitive)
- **Preconditions**
  - Program `Web Development 2026` exists
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `web development 2026`
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - If duplicates are **case-insensitive**, creation is rejected with “name already exists”
  - If duplicates are **case-sensitive**, creation succeeds (but this should be explicitly defined)
- **Priority**: High

### TC-008 — Create button must not create a record when validation fails
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `   ` in **Program Name**
  3. Click **Create** repeatedly (e.g., 3 times)
- **Expected result**
  - No program is created
  - No duplicate error appears (this is not a duplicate scenario)
  - No navigation to success page occurs
- **Priority**: Medium

## Edge cases

### TC-009 — Empty string is rejected (true empty, not just whitespace)
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Go to **Programs → Create Program**
  2. Leave **Program Name** empty
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Form is not submitted
  - “Program Name is required” (or equivalent) appears
- **Priority**: High

### TC-010 — Name with mixed allowed punctuation is accepted
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `C#/.NET: Développement (Avancé) — 2026` in **Program Name**
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Program is created successfully
  - Name is stored/displayed without character loss or replacement (unless explicitly normalized)
- **Priority**: Medium

### TC-011 — Non-ASCII letters are accepted (accented characters)
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter `Économie – Gestion des données` in **Program Name**
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Program is created successfully
  - Accents and punctuation persist correctly
- **Priority**: Medium

### TC-012 — Name consisting of whitespace-like Unicode characters is rejected (trim robustness)
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Go to **Programs → Create Program**
  2. Paste a name made of non-breaking spaces (e.g., `\u00A0\u00A0\u00A0`)
  3. Click **Create**
- **Expected result**
  - Treated as empty after trimming/normalization
  - Form is not submitted; required error shown
- **Priority**: Medium

### TC-013 — Max-length boundary: exactly max allowed length is accepted
- **Preconditions**
  - Admin user is logged in
  - Max length for **Program Name** is known (e.g., 255)
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter a program name of exactly the max allowed length (e.g., 255 characters)
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Program is created successfully
  - Name is stored completely (no truncation unless specified)
- **Priority**: High

### TC-014 — Max-length boundary: max+1 characters is rejected
- **Preconditions**
  - Admin user is logged in
  - Max length for **Program Name** is known
- **Steps**
  1. Go to **Programs → Create Program**
  2. Enter a name of max+1 characters
  3. Fill other required fields
  4. Click **Create**
- **Expected result**
  - Validation prevents submission (or server returns validation error)
  - Error indicates name is too long
  - No program is created
- **Priority**: High

### TC-015 — Duplicate prevention under concurrent creation attempts
- **Preconditions**
  - Two admin sessions available (two browsers or incognito + normal)
- **Steps**
  1. In Session A, open **Programs → Create Program**, set **Program Name** to `AI Testing Foundations`
  2. In Session B, open the same form, set **Program Name** to `AI Testing Foundations`
  3. Fill other required fields in both sessions
  4. Click **Create** in both sessions as close together as possible
- **Expected result**
  - Exactly one creation succeeds
  - The other is rejected with “name already exists” (server-side uniqueness enforced)
- **Priority**: High

### TC-016 — Duplicate detection with normalization of hyphens/spaces (if normalization exists)
- **Preconditions**
  - Program `Data-Science` exists
- **Steps**
  1. Try creating `Data – Science` (en dash)
  2. Try creating `Data - Science` (space-hyphen-space)
- **Expected result**
  - Either all are treated as distinct (no normalization) or treated as duplicates (normalization)
  - Behavior must be consistent and defined; if normalized, reject as duplicate
- **Priority**: Low

### TC-017 — Name containing newline/tab characters is handled safely
- **Preconditions**
  - Admin user is logged in
- **Steps**
  1. Enter `Web\tDevelopment 2026` (tab) or paste `Web Development\n2026` (newline) into **Program Name**
  2. Click **Create**
- **Expected result**
  - Either rejected as invalid characters or normalized (tabs/newlines removed) per spec
  - Must not create a visually confusing/multi-line name unless explicitly supported
- **Priority**: Low

## Ambiguities / gaps in the acceptance criteria
- **Duplicate matching rules**: Is duplicate detection **case-insensitive**? Does it trim only, or also normalize internal whitespace, Unicode variants (NBSP), hyphen types, accents, punctuation?
- **Max length**: No max/min character length for **Program Name** is specified.
- **Error UX**: Exact error message, where it appears (inline field vs toast), and whether Create is disabled vs submit blocked is not specified.
- **Storage/display rules**: Should the stored program name be trimmed automatically? Should internal multiple spaces be preserved or normalized?
- **Character policy**: AC says special characters are accepted, but doesn’t define which are disallowed (e.g., control characters, emojis, HTML/script injection strings).
- **Server-side enforcement**: AC implies prevention, but doesn’t explicitly require a backend uniqueness constraint (important for concurrency).
