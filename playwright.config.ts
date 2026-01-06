import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.test only if it exists (local development)
// In CI, environment variables are provided directly by GitHub Actions
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
}

/**
 * Extend Playwright test options with custom properties
 */
declare module '@playwright/test' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface PlaywrightTestOptions {
    supabaseUrl: string | undefined;
    supabaseKey: string | undefined;
  }
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Global timeout for each test - increased for generation tests */
  timeout: 60000, // 60 seconds per test
  /* Global setup to create shared test users */
  globalSetup: './e2e/global-setup.ts',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Pass env vars to tests and global setup */
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4321',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Enable downloads for PDF export tests */
    acceptDownloads: true,

    /* Increased action timeout for generation operations */
    actionTimeout: 30000, // 30 seconds for actions like generation

    /* Collect coverage */
    ...(process.env.COLLECT_COVERAGE && {
      // Enable JavaScript coverage collection
      contextOptions: {
        // This will be used by custom fixtures to collect coverage
        recordVideo: undefined,
      },
    }),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use default test user for tests that don't specify shared user
        storageState: process.env.E2E_USERNAME ? undefined : './e2e/.auth/BASIC_USER.json',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:4321/login',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes - increased for slower CI environments
    stdout: 'pipe', // Show server output for debugging
    stderr: 'pipe', // Show server errors for debugging
  },
});
