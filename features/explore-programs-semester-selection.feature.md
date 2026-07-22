# Programs — semester panel selection (discovered)

## Coverage snapshot
- Page: `/programs`
- Already covered: create, edit, delete, validation, list display
- Gap: selecting a list row to open the semester management panel

## Selected gap
**Flow:** Program row selection reveals semester panel  
**Why:** Right-hand panel is a distinct UI region; no existing spec asserts selection state.

## Gherkin test plan

Feature: Programs — semester panel selection (discovered)

  Scenario: Selecting a program reveals the semester panel
    Given I am logged in as admin
    And I am on the Programs page
    And a program exists in the list
    When I select that program in the list
    Then I do not see "Select a program to manage semesters"
    And I see "Semesters & scheduling config"
    And I see the button "+ Semester"
    And I see "No semesters yet"

  Scenario: Switching selection updates the semester panel heading
    Given I am logged in as admin
    And two programs exist in the list
    And I have selected the first program
    When I select the second program in the list
    Then the semester panel heading shows the second program name
    And the semester panel heading does not show the first program name
