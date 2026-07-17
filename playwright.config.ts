import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { AUTH_FILE } from './support/auth.constants';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  globalTeardown: './support/global-teardown.ts',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: process.env.DIDAXIS_URL,
    actionTimeout: 10_000,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
  ],
});
