# Eval report — suite reliability

**Repo:** [Qa-Hawk/AI-Powered-QA-Automation-course](https://github.com/Qa-Hawk/AI-Powered-QA-Automation-course)  
**Generated:** 2026-07-22  
**Window:** last **20** `Playwright Tests` workflow runs + all PRs (#1–#5)  
**Note:** Cursor has no built-in telemetry for these metrics. Numbers below come from GitHub Actions API, PR history, and session/PR review. Job logs and `playwright-report` artifacts require authenticated download (`Sign in to view logs`) — per-test retry lines were **not** available unauthenticated.

---

## Flake rate

| | |
| --- | --- |
| **Number** | **Unavailable** for pass-on-retry (0 confirmed flaky tests). Proxy: **0 / 20** Playwright runs concluded `success` (20 / 20 `failure`). |
| **How measured** | Listed `playwright.yml` runs via GitHub Actions API (`/actions/workflows/playwright.yml/runs?per_page=20`). Checked job annotations for the latest 10 — only `Process completed with exit code 1`. Artifacts named `playwright-report` exist on recent runs but could not be downloaded without `GH_TOKEN`; no HTML/JSON report parse for “passed on retry #N”. Config allows `retries: 2` on CI (`playwright.config.ts`), so flake *could* exist undetected. |
| **What it tells us** | The suite is systemically red in CI, so classic flake rate (green after retry) cannot be computed yet — stability work is blocked by a persistent first-attempt failure mode. |

---

## Heal success rate

| | |
| --- | --- |
| **Number** | **n/a** — **0 / 0** drift heals (no heal attempts in window). **Masked-regression count: 0** (must stay 0). |
| **How measured** | `search_pull_requests` for `heal` / `self-heal` / `drift` → 0 hits. PR list (#1–#5) and branch names show no `heal/<…>` repair PRs. Orchestrator registers `self-heal` only after triage classifies **test issue (drift)**; no such PR trail yet. Masked regressions would be heal diffs that delete/soften `expect(` or change assertions — none to review → **0**. |
| **What it tells us** | The heal path is unused, not proven. Zero masked regressions is good only as a vacuous baseline; the next heal must keep assertions unchanged and be counted here. |

---

## Generation-gate pass rate

| | |
| --- | --- |
| **Number** | **0 / 4 (0%)** — none of the generation-style first PRs were green **and** conforming **and** mapped to AC. |
| **How measured** | PR history (#1 DS-4, #2 DS-6/explore, #3 DS-5, #5 DS-5 cloud generation). For each, first Playwright check run via `pull_request_read` / Actions: all `conclusion: failure`. Gate = CI green ∧ conventions (tags, POM, cleanup) ∧ maps-to-AC (feature/Gherkin linked). #5 maps to `features/DS-5.feature.md` but CI failed and tests lack required tags; #1/#3/#2 also red on first check. Local “green” claims in PR bodies do not satisfy the CI gate. |
| **What it tells us** | Agents can open ticket-linked PRs, but the “first PR green + conforming” bar is not being met — generation is shipping into a red pipeline. |

---

## Ask-vs-guess

| | |
| --- | --- |
| **Number** | **Asked: 0 · Invented / assumed: ≥ 3** (this constitution/setup session + PR #5 review). |
| **How measured** | Session review of this chat (no clarifying questions to the human before choosing names, factory shape, or ALT vs `DIDAXIS_NONADMIN_*`). PR #5 body: correctly refused inventing Didaxis credentials (environment-blocked), but assumed empty-state copy/locators and hardcoded scenario strings without a human confirm on AC ambiguities called out in the feature footer. No Cursor ask/guess telemetry exists — count is manual. |
| **What it tells us** | Default behavior is still to invent workable values when AC/env gaps appear; we need a hard stop (“ask or skip”) for undefined UI copy and missing secrets. |

---

## Top reliability risk

**CI never goes green** (20 consecutive `Playwright Tests` failures). That blinds flake measurement, fails the generation gate by definition, and leaves heal unexercised.

## Next action

1. Authenticate (`gh auth login` or `GH_TOKEN`) and download the latest `playwright-report` artifact (e.g. run [29968989157](https://github.com/Qa-Hawk/AI-Powered-QA-Automation-course/actions/runs/29968989157)).  
2. Fix the dominant failure (first failing test in that report).  
3. Re-run this report: parse report JSON for pass-on-retry flake rate; re-score generation-gate on the next ticket PR.
