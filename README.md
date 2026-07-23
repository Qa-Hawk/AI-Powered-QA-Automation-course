# AI-Powered QA Automation

Playwright suite for [Didaxis Studio](https://test.didaxis.studio), plus Cursor agents/skills that turn Jira tickets into specs and triage red builds.

## Setup

```bash
git clone <repo-url>
cd AI-Powered-QA-Automation-course
npm install
npx playwright install chromium
cp .env.example .env
```

Edit `.env` with real values (see below). Never commit `.env`.

## Environment

| Section | When you need it |
| --- | --- |
| **Run tests** | Required to clone and run Playwright |
| **Agent / CI** | Headless agent in `.github/workflows/test-generation.yml`; MCP tokens in Cursor settings — not needed for `npx playwright test` alone |

Copy from [`.env.example`](.env.example). Each variable has a short comment there.

**Run tests (required):** `DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`, `DIDAXIS_API_TOKEN`  
**Optional permission probes:** `DIDAXIS_ALT_EMAIL`, `DIDAXIS_ALT_PASSWORD` (specs that probe non-admin access currently read `DIDAXIS_NONADMIN_*` — set those to the same values)  
**Agent / CI:** `CURSOR_API_KEY`, `ATLASSIAN_API_TOKEN`, `ATLASSIAN_BASE_URL`, `ATLASSIAN_EMAIL`

## Run tests

```bash
# Full suite (auth setup + Didaxis specs)
npm test

# One file
npx playwright test tests/ds1-create-program.spec.ts

# Tagged slices (exactly one tag per test)
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:e2e
npm run test:destructive   # --workers=1; shared/global state only
```

Tags: `@smoke` · `@sanity` · `@regression` · `@api` · `@e2e` · `@destructive`  
`@destructive` is only for tests that mutate shared/global state (locale, roles, flags, settings) and must revert via `afterEach` / `afterAll`. Self-cleaning CRUD keeps its importance tag.

HTML report: `npx playwright show-report`

## Cursor agents & skills

Always-on guardrails: [`.cursor/rules/constitution.mdc`](.cursor/rules/constitution.mdc).

| Path | Role |
| --- | --- |
| `.cursor/rules/qa-orchestrator.mdc` | Coordinator: ticket → plan → test-writer → run → triage/heal |
| `.cursor/rules/playwright-conventions.mdc` | Hard refusals when writing/repairing specs |
| `.cursor/skills/explore-and-generate` | Ticket-less coverage discovery → Gherkin plan |
| `.cursor/skills/self-heal` | Locator drift repair after triage says **test issue** |
| `.agents/skills/*` | `jira-ticket-analyzer`, `pom-conventions`, `api-cleanup`, `ci-failure-triage`, `jira-bug-reporter`, … |
| `.cursor/hooks/` | Blocks WON'T violations on `Write` to `tests/**` and `pages/**` |

Point Atlassian / Playwright MCP servers at the Agent/CI vars (or Cursor Settings → MCP). Local Playwright only needs the **Run tests** block in `.env`.
