# DS-4 — Delete program with confirmation

Feature: Delete program with confirmation
  As an admin user, I want to delete a program I no longer need,
  with a confirmation step to prevent accidental deletion.

# Happy paths

TC-001 — Delete program with confirmation
Scenario: Delete program with confirmation
  Given a program "Test Program <timestamp>" exists
  And I am on the Programs page
  When I click the delete icon for "Test Program <timestamp>"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program <timestamp>" is removed from the program list

TC-002 — Cancel program deletion
Scenario: Cancel program deletion
  Given a program "Test Program <timestamp>" exists
  And I am on the Programs page
  When I click the delete icon for "Test Program <timestamp>"
  And I see the confirmation dialog
  And I dismiss / cancel the confirmation
  Then "Test Program <timestamp>" still exists in the program list

TC-003 — Delete icon is available per program row
Scenario: Delete control is visible for an existing program
  Given a program "Test Program <timestamp>" exists
  And I am on the Programs page
  Then I see a delete control for "Test Program <timestamp>"

TC-004 — List updates without manual refresh after delete
Scenario: Program list updates after confirmed delete
  Given a program "Test Program <timestamp>" exists and is visible in the list
  When I delete "Test Program <timestamp>" and confirm
  Then "Test Program <timestamp>" is gone from the list without a manual page refresh

# Negative

TC-005 — Delete API failure does not remove the program
Scenario: Backend delete failure keeps the program
  Given a program "Test Program <timestamp>" exists
  And the delete API returns an error
  When I click the delete icon and confirm deletion
  Then "Test Program <timestamp>" still exists in the program list
  And I see a user-visible error message (or the app does not silently succeed)

TC-006 — Non-admin user cannot delete a program (skip if no non-admin creds)
Scenario: Non-admin cannot delete
  Given I am logged in as a non-admin user
  And a program "Test Program <timestamp>" exists
  When I navigate to the Programs page
  Then the delete action is not available or is blocked

# Edge cases

TC-007 — Deleting one of several similar names only removes the target
Scenario: Similar program names are not confused on delete
  Given programs "Web Dev <timestamp>" and "Web Dev <timestamp> Extra" both exist
  When I delete "Web Dev <timestamp>" and confirm
  Then "Web Dev <timestamp>" is removed
  And "Web Dev <timestamp> Extra" still exists

TC-008 — Double-clicking delete does not open duplicate confirmations / duplicate DELETEs
Scenario: Rapid double-delete is safe
  Given a program "Test Program <timestamp>" exists
  When I double-click the delete icon for "Test Program <timestamp>"
  Then only one confirmation dialog is shown
  And confirming once removes the program exactly once

TC-009 — Special characters in program name delete correctly
Scenario: Delete program with special characters in name
  Given a program "Web Dev & Design: Full-Stack (100%) <timestamp>" exists
  When I delete it and confirm
  Then it is removed from the program list

TC-010 — Unicode program name delete correctly
Scenario: Delete program with Unicode name
  Given a program "Système Éducatif — 教育 <timestamp>" exists
  When I delete it and confirm
  Then it is removed from the program list

<!--
  Ambiguities / gaps:
  1. Confirmation UX: AC says "confirmation dialog" / "Cancel" but the live app
     uses the native browser confirm() (see related bugs DS-30, etc.). Tests should
     handle Playwright dialog events (accept/dismiss), not an in-app modal, unless
     product confirms an in-app dialog is required.
  2. Error UX on failed DELETE is not specified (message text, toast, modal).
  3. Non-admin delete behavior is not in AC; TC-006 is skipped without creds.
  4. Double-submit / double-confirm behavior is not in AC; TC-008 documents
     expected safe behavior and may surface known demo bugs (related: DS-30).
  5. Empty-list / last-program-deleted empty-state transition is not in AC;
     not covered here — belongs with DS-5 empty-state coverage if needed.
-->
