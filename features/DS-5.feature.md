# DS-5 — Program list filtering and display

Feature: Program list display
  As an admin user, I want to see all programs in a clear list
  so that I can quickly find and manage them.

# Happy paths

TC-001 — Programs page displays the list when programs exist
Scenario: Display the program list
  Given at least one program exists in the system
  When I navigate to the Programs page
  Then I see the "Programs" heading
  And I see the programs table

TC-002 — Each program shows its name and description
Scenario: Display program list with key details
  Given a program "Program List <timestamp>" with description "Curriculum overview for cohort <timestamp>" exists
  When I navigate to the Programs page
  Then I see the program's name in the list
  And I see the program's description in the list

TC-003 — A newly created program appears in the list with its description
Scenario: Newly created program is listed
  Given I am on the Programs page
  When I create a program "Program List <timestamp>" with description "Fresh cohort <timestamp>"
  Then the new program's name appears in the list
  And the new program's description appears in the list

TC-004 — Empty state message and create prompt shown when no programs exist
Scenario: Empty state when no programs exist
  Given no programs exist (programs list API returns { data: [] })
  When I navigate to the Programs page
  Then I see the message "No programs yet. Create your first program to get started."
  And I see a "Create Program" button prompting me to create the first program

# Negative

TC-005 — Programs list load failure is handled gracefully
Scenario: Programs list API returns 500
  Given the programs list API returns a 500 error
  When I navigate to the Programs page
  Then the application does not crash
  And the "Programs" heading is still visible

TC-006 — Non-admin user access to the program list (skipped — creds unavailable)
Scenario: Non-admin views the program list
  Given I am signed in as a non-admin user
  When I navigate to the Programs page
  Then I can see the program list without management actions

# Edge cases

TC-007 — Program name with special characters displays correctly
Scenario: Special characters in program name
  Given a program named "Web Dev & Design: Full-Stack (100%) <timestamp>" exists
  When I navigate to the Programs page
  Then the program name renders exactly as entered

TC-008 — Program name with Unicode displays correctly
Scenario: Unicode characters in program name
  Given a program named "Système Éducatif — 教育 <timestamp>" exists
  When I navigate to the Programs page
  Then the program name renders exactly as entered

TC-009 — Long name and description render without breaking the list
Scenario: Long name and description
  Given a program with a 200-character name and 200-character description exists
  When I navigate to the Programs page
  Then both the name and description render and remain visible

TC-010 — List remains consistent after page reload
Scenario: List consistency across reload
  Given a program "Program List <timestamp>" exists and is visible in the list
  When I reload the Programs page
  Then the program is still visible in the list

# Ambiguities / gaps for human review
#
# 1. The ticket mentions "filtering" in the summary ("Program list filtering and
#    display"), but neither acceptance criterion defines a search/filter control,
#    filter fields, or expected behavior. No filtering scenarios were authored.
#    -> Needs product clarification: is client-side/server-side filtering in scope
#       for DS-5, and what are the filter fields (name? description? status?).
#
# 2. Empty state cannot be produced against shared live data, so TC-004 uses
#    Playwright network mocking to return { data: [] } for the programs list GET.
#    -> Confirm this is acceptable, or provide an isolated tenant / seed-reset hook.
#
# 3. The AC does not specify behavior on API load failure. TC-005 only asserts the
#    app does not crash and the heading remains visible.
#    -> Needs expected UX for load errors (error banner? retry? empty state?).
#
# 4. Max length limits for name/description are not specified in the ticket. TC-009
#    uses 200-character values as a reasonable "long" boundary, not a hard max.
#    -> Confirm the real max length so a true boundary test can be written.
#
# 5. Non-admin behavior (TC-006) is undefined by the ticket and no non-admin
#    credentials are available, so it is skipped.
#    -> Confirm expected non-admin experience (read-only? redirect? 403?).
