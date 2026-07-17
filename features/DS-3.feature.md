Feature: DS-3 — Program name validation and duplicate prevention

  As an admin user, I want the system to prevent invalid or duplicate program names
  so that data integrity is maintained.

  # Happy paths

  Scenario: Accept program name with special characters
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully

  # Negative

  Scenario: Reject program name with only whitespace
    Given I am on the program creation form
    When I enter "   " as the program name
    And I click Create
    Then the form is not submitted (name is trimmed, treated as empty)

  Scenario: Reject duplicate program name
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the same name
    Then I see an error indicating the name already exists

<!--
  Ambiguities / gaps:
  - Whitespace AC says "click Create" but the app disables Create for whitespace-only
    names; acceptable interpretation is the form is not submitted.
  - Duplicate rejection is not implemented in the demo app (see DS-32); automation
    marks TC-003 with test.fail until fixed.
-->
