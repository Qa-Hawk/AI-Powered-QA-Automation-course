import { test as base, expect } from '@playwright/test';
import { trackProgramId } from '../support/program-tracker';

const PROGRAMS_POST = /\/api\/programs\/?$/;

export function trackProgram(uuid: string): void {
  trackProgramId(uuid);
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const pending = new Set<Promise<void>>();

    page.on('response', (response) => {
      const task = (async () => {
        const request = response.request();
        if (request.method() !== 'POST' || !response.ok()) {
          return;
        }

        let pathname: string;
        try {
          pathname = new URL(response.url()).pathname;
        } catch {
          return;
        }

        if (!PROGRAMS_POST.test(pathname)) {
          return;
        }

        try {
          const body = await response.json();
          const id = body?.data?.id ?? body?.id;
          if (typeof id === 'string' && id.length > 0) {
            trackProgram(id);
          }
        } catch {
          // Ignore non-JSON responses.
        }
      })();

      pending.add(task);
      void task.finally(() => pending.delete(task));
    });

    await use(page);
    await Promise.all([...pending]);
  },
});

export { expect };