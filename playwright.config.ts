import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { AUTH_FILE } from './support/auth.constants';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  globalSetup: './support/global-setup.ts',
  globalTeardown: './support/global-teardown.ts',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['./support/program-cleanup-reporter.ts'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: process.env.DIDAXIS_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'didaxis',
      testMatch: '**/ds*.spec.ts',
      use: {
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
    {
      name: 'todomvc',
      testMatch: '**/*.spec.ts',
      testIgnore: [/auth\.setup\.ts/, '**/ds*.spec.ts'],
    },
  ],
});