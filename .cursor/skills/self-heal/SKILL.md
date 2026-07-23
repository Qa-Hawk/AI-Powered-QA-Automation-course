---
name: self-heal
description: >-
  Repairs Playwright failures caused by locator drift after UI changes: patch
  POM role/name selectors from trace + live a11y tree, re-run unchanged specs,
  open a PR. Use when the build is red because a locator broke, fix the drifted
  selector, the test broke after a UI change, or heal the suite — ONLY after
  triage classifies the red run as a test issue (drift), never for a real app
  bug. If classification is missing or says app bug, stop and use
  ci-failure-triage / jira-bug-reporter instead.
---

# Self-Heal (Locator Drift)

Fix **one** broken locator per run. Every successful heal ships as a **pull request**.

## Prerequisites

- **Drift classification required.** The red run must already be classified as a
  **test issue (locator drift)** — from `ci-failure-triage` or an equivalent
  diagnosis that explicitly says drift/test issue, not app bug.
- If triage was skipped, classification is unknown, or the verdict is **real app
  bug**: **stop**. Run or follow `ci-failure-triage`, then route to
  `jira-bug-reporter`. Do not patch locators for product defects.

## Workflow

Copy and track:

```
Self-heal progress:
- [ ] 1. Confirm drift classification
- [ ] 2. Trace → failing locator + POM
- [ ] 3. Re-discover element (Playwright MCP a11y)
- [ ] 4. Patch POM (minimal role-based diff)
- [ ] 5. Re-run; prove green with assertions unchanged
- [ ] 6. Report old→new locator + green run; open PR
```

### 1. Require triage’s drift classification

Do not start healing without an explicit **test issue / drift** verdict tied to
the failing CI run (run id, test name, PR if applicable).

| Verdict | Action |
|---------|--------|
| Test issue / locator drift | Continue below |
| App bug / behavior mismatch | Stop → `jira-bug-reporter` |
| No triage yet | Stop → `ci-failure-triage` first |

### 2. From the trace, find the failing locator and its POM

From the Playwright error and trace (CI artifact or local `--trace on`):

- Identify the **failing test** and stack frame that used the locator.
- Map the call to a **Page Object** in `pages/` per `pom-conventions` — not
  inline locators in specs.
- Record the **current** locator definition (role, name/options) and file path.

### 3. Re-discover the element via Playwright MCP

Use the **accessibility tree** only (`browser_snapshot` — role + accessible name).

1. Navigate to the same route/state as the failing step (reuse
   `playwright/.auth/user.json` when the flow is authenticated).
2. Find the control by **role + current accessible name** (and stable context
   such as dialog name or landmark), matching user intent — not CSS/XPath.
3. Confirm the element supports the action the POM method performs (click,
   fill, etc.).

Do not guess from screenshots alone.

### 4. Patch the locator in the POM

- Apply a **minimal** diff: update `getByRole` / `getByLabel` / `getByText`
  (per `pom-conventions`) to match the live tree.
- **Only edit Page Objects** — never change spec **assertions** or weaken
  expectations to force green.
- Do not refactor unrelated POM methods in the same change.

### 5. Re-run and prove green with assertions unchanged

```bash
npx playwright test <path-or-grep-for-the-single-failing-test>
```

Rules:

- Spec files and `expect(...)` calls must be **byte-identical** to pre-heal
  (locator fixes live in POMs only).
- **Green via weakened assertion is a failure of this skill** — revert any spec
  change, escalate (human review + triage), do not open a heal PR.
- If still red after one locator fix, **stop**; do not chain a second locator
  in the same run. Report findings and let triage/heal run again separately.

### 6. Report and open a PR

Post a concise summary (PR comment or PR body):

| Field | Content |
|-------|---------|
| CI run | Link / run id of the original red build |
| Test | Spec name + line that failed |
| POM file | Path |
| Locator diff | Old → new (role/name/options) |
| Proof | Local or CI re-run result — pass with assertions unchanged |

**One repair per run.** Create **one PR** containing only the POM locator fix
(and any auth/env docs strictly required to reproduce the green run). Do not
merge automatically — human review approves.

## Related skills

- `ci-failure-triage` — classify before heal; evidence from trace/report
- `jira-bug-reporter` — when the failure is not drift
- `pom-conventions` — locator style and `pages/` layout
