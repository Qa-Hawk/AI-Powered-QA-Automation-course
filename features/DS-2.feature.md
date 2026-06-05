Feature: DS-2 — Edit existing program details

  As an admin user, I want to edit an existing program's details so that I can
  correct or update program information after creation.

  # Happy paths

  Scenario: Open program for editing
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with Description "Full-stack web development program for 2026 cohort."
    When I click the edit icon on "Web Development 2026"
    Then I see the Edit Program modal
    And the Program Name field shows "Web Development 2026"
    And the Description field shows "Full-stack web development program for 2026 cohort."

  Scenario: Successfully edit a program name
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  Scenario: Edit preserves unchanged fields
    Given I am editing "Web Development 2026"
    And the Program Name is "Web Development 2026"
    And the Description is "Full-stack web development program for 2026 cohort."
    When I change the Description to "Updated description: includes React, Node.js, and CI/CD."
    And I leave the Program Name unchanged
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the Description is updated to "Updated description: includes React, Node.js, and CI/CD."

  Scenario: Re-open edit form shows persisted changes after save
    Given I have saved "Web Development 2026" as "Web Development 2026 - Updated"
    When I click the edit icon on "Web Development 2026 - Updated"
    Then the Edit Program modal opens
    And the Program Name field shows "Web Development 2026 - Updated"

  Scenario: Editing updates the existing program in place
    Given I am on the Programs page with a known number of programs
    And I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the total number of programs in the list is unchanged
    And no additional program row is created

  # Negative

  Scenario: Save is blocked when Program Name is cleared
    Given I am editing "Web Development 2026"
    When I clear the Program Name field
    And I click Save
    Then the modal remains open
    And the program list still shows "Web Development 2026"

  Scenario: Duplicate program name is rejected on edit
    Given a program "Web Development 2026" exists
    And a program "Data Science 2026" exists
    And I am editing "Web Development 2026"
    When I change the Program Name to "Data Science 2026"
    And I click Save
    Then the save is rejected with a user-visible error
    And the program list still shows "Web Development 2026"
    And the program list still shows "Data Science 2026"

  Scenario: Script injection in Program Name is not executed
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Web Dev <script>alert(\"x\")</script> 2026"
    And I click Save
    Then no script is executed in the browser
    And the program name is either rejected or safely escaped on display

  Scenario: Save failure does not update the program list
    Given I am editing "Web Development 2026"
    And the backend returns an error when saving
    When I change the Description to "Updated description: includes React, Node.js, and CI/CD."
    And I click Save
    Then the modal remains open
    And I see a user-visible error message
    And the program list still shows "Web Development 2026" with the original description

  Scenario: Cancel does not persist unsaved changes
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Cancel
    Then the modal closes
    And the program list still shows "Web Development 2026"

  Scenario: Non-admin user cannot edit a program
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I attempt to edit "Web Development 2026"
    Then the edit action is not available or is blocked with an authorization error
    And the program details remain unchanged

  Scenario: Double-clicking Save does not send duplicate update requests
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I double-click Save
    Then only one update is applied
    And the program list shows exactly one "Web Development 2026 - Updated" entry

  # Edge cases

  Scenario: Program Name accepts common special characters on edit
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 — Updated (C#/.NET + React) [Evening]"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026 — Updated (C#/.NET + React) [Evening]"

  Scenario: Program Name handles Unicode characters on edit
    Given I am editing "Web Development 2026"
    When I change the Program Name to "Desarrollo Web 2026 — Actualizado"
    And I click Save
    Then the modal closes
    And the program list shows "Desarrollo Web 2026 — Actualizado"

  Scenario: Leading and trailing whitespace in Program Name is handled consistently
    Given I am editing "Web Development 2026"
    When I change the Program Name to "  Web Development 2026 - Updated  "
    And I click Save
    Then the program list shows "Web Development 2026 - Updated"

  Scenario: Program Name at maximum allowed length is accepted on edit
    Given I am editing "Web Development 2026"
    When I change the Program Name to a 255-character string
    And I click Save
    Then the modal closes
    And the program list shows the 255-character program name

  Scenario: Program Name exceeding maximum length is blocked on edit
    Given I am editing "Web Development 2026"
    When I attempt to change the Program Name to a 256-character string
    Then the input is prevented from exceeding the limit or validation is shown
    And the save is rejected or the Save button remains disabled

  Scenario: Description can be cleared on edit
    Given I am editing "Web Development 2026"
    And the Description is "Full-stack web development program for 2026 cohort."
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program "Web Development 2026" has an empty Description

  Scenario: Program list updates without manual refresh after edit
    Given I am on the Programs page
    And I am editing "Web Development 2026"
    When I change the Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then "Web Development 2026 - Updated" is visible in the program list without a manual page refresh

  Scenario: Concurrent edit by another user is handled safely
    Given Admin A is editing "Web Development 2026"
    And Admin B has already saved "Web Development 2026" as "Web Development 2026 - Updated by B"
    When Admin A changes only the Description and clicks Save
    Then the system either shows a conflict warning or applies a clearly defined last-write-wins rule
    And no silent data loss occurs without user notification

  # Ambiguities / gaps in the Acceptance Criteria

  # - Field list: AC references "other fields" but only Name and Description are
  #   demonstrated. Which additional fields exist (dates, status, capacity)?
  # - Description values: AC does not specify example Description text for the
  #   "only change Description" scenario; expected updated text is undefined.
  # - Validation rules: No explicit requirements for required fields, max lengths,
  #   allowed characters, trimming, or name uniqueness (case sensitivity, whitespace).
  # - "Immediately shows": Unclear whether the list updates via optimistic UI,
  #   refetch, or requires manual refresh; sort order after rename is unspecified.
  # - Error handling: No specified UX for API/network failures (error message text,
  #   modal stay-open behavior, retry, spinner on Save).
  # - Cancel behavior: AC does not mention Cancel or close-without-save; expected
  #   discard behavior is undefined.
  # - Permissions: Story says "admin user" but no AC covers non-admin edit access.
  # - Duplicate names: No uniqueness rule in AC; related bugs suggest duplicates may
  #   be accepted without a visible error on edit.
  # - Max length: No explicit limit in AC; related bugs reference 255 characters.
  # - Double-submit: No AC for rapid double-click on Save; related bugs indicate
  #   duplicate PATCH requests are a known risk.
  # - Concurrency: No guidance for simultaneous edits (conflict vs last-write-wins).
  # - Sanitization: No expectation for HTML/script injection handling in fields.
