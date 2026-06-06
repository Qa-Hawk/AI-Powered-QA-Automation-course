import { test as base, expect, type Page } from '@playwright/test';
import { deleteProgram, findProgramIdByName } from '../support/delete-program';

export type ProgramCleanup = {
  /** Track a program UUID for deletion after the test. */
  register: (programId: string) => void;
  /** Resolve a program by name via GET /api/programs and track it for cleanup. */
  registerByName: (name: string) => Promise<void>;
  /** Listen for POST /api/programs responses on a page and auto-track created program IDs. */
  attach: (page: Page) => void;
};

export const test = base.extend<{ programCleanup: ProgramCleanup }>({
  programCleanup: async ({}, use, testInfo) => {
    const pendingIds = new Set<string>();
    const attachedPages = new WeakSet<Page>();

    const register = (programId: string) => {
      pendingIds.add(programId);
    };

    const registerByName = async (name: string) => {
      const id = await findProgramIdByName(name);
      if (id) pendingIds.add(id);
    };

    const attach = (page: Page) => {
      if (attachedPages.has(page)) return;
      attachedPages.add(page);

      page.on('response', async (response) => {
        const request = response.request();
        if (request.method() !== 'POST') return;

        const pathname = new URL(response.url()).pathname;
        if (!/\/api\/programs\/?$/.test(pathname)) return;
        if (!response.ok()) return;

        try {
          const body = await response.json();
          const id = body?.data?.id ?? body?.id;
          if (typeof id === 'string') pendingIds.add(id);
        } catch {
          // Ignore non-JSON responses.
        }
      });
    };

    await use({ register, registerByName, attach });

    const ids = [...pendingIds];
    const failures: string[] = [];

    for (const id of ids) {
      const result = await deleteProgram(id);
      if (!result.success && result.status !== 404) {
        failures.push(`${id}: ${result.status} ${result.message ?? ''}`.trim());
      }
    }

    if (failures.length > 0) {
      console.warn(
        `[programCleanup] "${testInfo.title}" failed to delete ${failures.length}/${ids.length} program(s):\n` +
          failures.map((failure) => `  - ${failure}`).join('\n'),
      );
    }
  },

  context: async ({ context, programCleanup }, use) => {
    context.on('page', (page) => programCleanup.attach(page));
    await use(context);
  },
});

export { expect };
