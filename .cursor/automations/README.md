# Cursor Automations — DS backlog test generation

## DS backlog — generate tests

Draft: [`ds-backlog-tests.workflow.json`](./ds-backlog-tests.workflow.json)  
Prompt (copy-paste): [`ds-backlog-tests.prompt.md`](./ds-backlog-tests.prompt.md)

Cloud agents cannot call the IDE `open_automation` prefill tool. Create the automation in the editor from this draft.

### Create in Cursor

1. Open [cursor.com/automations/new](https://cursor.com/automations/new) (or Agents Window → Automations → New).
2. **Name:** `DS backlog — generate tests`
3. **Description:** Weekday 21:25 America/New_York plus optional Jira webhook: drain DS tickets In Progress without tests-generated — analyze, write Playwright specs, run tests, open PRs, label tickets. Max 5 tickets per run; never merge.
4. **Triggers (both):**
   - **Schedule:** cron `25 21 * * 1-5` — set timezone to **America/New_York**
   - **Webhook:** incoming HTTP webhook (save first to get URL + API key; wire Jira after save)
5. **Git checkout:** repo `Qa-Hawk/AI-Powered-QA-Automation-course`, branch `main`
6. **Tools:** enable MCP servers **atlassian** and **github**; terminal is available for `npx playwright test`; leave pull-request creation on
7. **Instructions:** paste the contents of `ds-backlog-tests.prompt.md` (or the `prompts[0].prompt` field from the JSON)
8. Save and enable the automation

### After save — Jira webhook

1. Copy the automation webhook URL and API key from the editor.
2. In Jira, add an automation rule: when an issue moves to **In Progress**, POST to that webhook (include issue key in the payload if you want).
3. The agent still re-queries Jira with the Backlog JQL; the webhook is a wake-up, not a substitute for the queue query.

### Guardrails (in prompt)

- Max **5** tickets per run
- Label `tests-generated` only on normal completion
- Same-spec same-error twice → leave PR open, skip label, continue if budget remains
- **Never merge** PRs
- **Never** transition, resolve, or close Jira issues
