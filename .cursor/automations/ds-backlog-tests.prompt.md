Backlog mode QA orchestrator. Follow @.cursor/rules/qa-orchestrator.mdc (Backlog mode section).
The outer runner started this automation — you do not decide when to run.

1. Query Jira: project = DS AND status = "In Progress" AND labels != tests-generated (ORDER BY rank ASC). If the queue is empty, reply with a one-line summary and stop.

2. Process up to 5 tickets sequentially (one branch + one PR per ticket). For each ticket:
   - Analyze: apply jira-ticket-analyzer; save to features/{KEY}.feature.md
   - Delegate test-writer (playwright-conventions.mdc, pom-conventions, api-cleanup for data-creating tests)
   - Run: npx playwright test (prefer scoping to new/changed specs)
   - Red run: triage (ci-failure-triage) then route per orchestrator Heal on red — never merge repair PRs or file bugs without human approval

3. Per ticket output: open a GitHub PR linked to the Jira ticket; add label tests-generated when the pipeline completes normally. If the same spec fails with the same error twice on that ticket, leave the PR open, do not add tests-generated, and continue to the next ticket if budget remains.

Never merge PRs. Never transition, resolve, or close Jira issues.
