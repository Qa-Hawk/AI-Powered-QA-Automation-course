Feature: DS-1 — Create new academic program

  As an admin user, I want to create a new academic program so that I can begin
  designing its curriculum structure.

  # Happy paths

  Scenario: Navigate to program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  Scenario: Successfully create a program
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Create button becomes enabled when Program Name is populated
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I leave Description empty
    Then the Create button is enabled

  Scenario: Description supports typical punctuation and saves as entered
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program (HTML/CSS/JS + APIs)."
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Program can be created with empty Description
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I leave Description empty
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  # Negative

  Scenario: Validation prevents empty program name
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  Scenario: Create is disabled when Program Name contains only whitespace
    Given I am on the program creation form
    When I fill in Program Name with "   "
    And I click outside the Program Name field
    Then the Create button is disabled

  Scenario: Non-admin user cannot create a new program
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then the "+ New Program" button is not visible or not enabled
    And I cannot create a program named "Web Development 2026"

  Scenario: Failed create does not close the modal or add the program
    Given I am on the program creation form
    And the backend returns an error when creating a program
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal remains open
    And the program list does not show "Web Development 2026"
    And I see a user-visible error message

  Scenario: Double-clicking Create does not create duplicate programs
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I double-click Create
    Then only one program named "Web Development 2026" exists in the program list

  # Edge cases

  Scenario: Program Name accepts common special characters
    Given I am on the program creation form
    When I fill in Program Name with "Web Development: Full-Stack (2026)"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development: Full-Stack (2026)"

  Scenario: Program Name handles Unicode characters
    Given I am on the program creation form
    When I fill in Program Name with "Desarrollo Web 2026 — Avanzado"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Desarrollo Web 2026 — Avanzado"

  Scenario: Program Name trims leading and trailing spaces
    Given I am on the program creation form
    When I fill in Program Name with "  Web Development 2026  "
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Program Name at maximum allowed length is accepted
    Given I am on the program creation form
    When I fill in Program Name with a 255-character string
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  Scenario: Program Name exceeding maximum length is blocked
    Given I am on the program creation form
    When I attempt to fill in Program Name with a 256-character string
    Then the input is prevented from exceeding the limit or validation is shown
    And the Create button remains disabled or creation is rejected

  Scenario: Duplicate program name is handled correctly
    Given a program named "Web Development 2026" already exists in the program list
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the system blocks the duplicate with a clear validation error
    And only one program named "Web Development 2026" exists in the program list

  Scenario: Program list updates without manual refresh after create
    Given I am on the Programs page
    When I create a program named "Web Development 2026" via "+ New Program"
    Then "Web Development 2026" is visible in the program list without a manual page refresh

  # Ambiguities / gaps in the Acceptance Criteria

  # - Form type: AC states "the modal closes" but does not define cancel/close behavior
  #   or whether the creation form is always a modal vs. a separate page.
  # - Field requirements: Only Program Name validation is specified. Is Description
  #   optional or required? Are min/max lengths defined for either field?
  # - Duplicate handling: No rule for duplicate Program Name (case sensitivity,
  #   whitespace trimming, uniqueness scope). Related bugs (DS-15) suggest duplicates
  #   may currently be accepted.
  # - Error handling: No expected UX for API/network failures (message text, retry,
  #   spinner, whether Create disables during save).
  # - Permissions: Non-admin behavior is not specified (button hidden vs. disabled vs.
  #   server-side rejection).
  # - Max length: No explicit limit in AC; related bugs (DS-14) reference 255 characters.
  # - Double-submit: No AC for rapid double-click on Create; related bugs (DS-16, DS-17)
  #   indicate this is a known risk.
  # - List behavior: No explicit requirement for sort order, pagination, or placement of
  #   newly created programs in the list.
  # - Sanitization: No expectation for HTML/script injection handling in Program Name
  #   or Description fields.
