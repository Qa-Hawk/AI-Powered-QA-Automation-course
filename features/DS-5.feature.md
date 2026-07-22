Feature: DS-5 — Program list filtering and display

  As an admin user, I want to see all programs in a clear list
  so that I can quickly find and manage them.

  # Happy paths

  Scenario: Display each program's name and description
    Given I am logged in as admin
    And the programs "Youth Leadership 2026" and "STEM Scholars" exist
    When I navigate to the Programs page
    Then I see a program list
    And the "Youth Leadership 2026" row shows "A 12-week leadership program for high school students."
    And the "STEM Scholars" row shows "Scholarships and mentoring for first-generation STEM majors."

  Scenario: Display an empty state when no programs exist
    Given I am logged in as admin
    And no programs exist in the system
    When I navigate to the Programs page
    Then I see a message that no programs have been created
    And I see a prompt to create the first program
    And I do not see an empty programs table

  Scenario: Open program creation from the empty-state prompt
    Given I am logged in as admin
    And no programs exist in the system
    When I navigate to the Programs page
    And I click "Create Program"
    Then I see the "New Program" form

  # Negative

  Scenario: Do not show the empty state when a program exists
    Given I am logged in as admin
    And the program "Youth Leadership 2026" exists
    When I navigate to the Programs page
    Then I see "Youth Leadership 2026" in the program list
    And I do not see the no-programs message
    And I do not see the create-first-program prompt

  # Edge cases

  Scenario: Render special characters in program details
    Given I am logged in as admin
    And the program "Café & Résumé Prep" exists with description "Career support: CV review, mock interviews, and networking."
    When I navigate to the Programs page
    Then the program name displays as "Café & Résumé Prep"
    And its description displays as "Career support: CV review, mock interviews, and networking."

<!--
  Ambiguities / gaps:
  - The title mentions filtering, but the acceptance criteria define no search, filter,
    sorting, pagination, or ordering behavior.
  - The acceptance criteria do not specify the exact empty-state message or prompt text.
  - Behavior for missing descriptions, duplicate names, loading failures, and non-admin
    users is not defined.
-->
