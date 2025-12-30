import { test as base, type BrowserContext } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';
import fs from 'fs';
import path from 'path';

type TestFixtures = {
  supabase: SupabaseClient<Database>;
  testUserId: string;
  cleanDatabase: () => Promise<void>;
  context: BrowserContext; // Override context to add coverage collection
};

/**
 * Creates a Supabase client for E2E test database operations.
 * Uses PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY.
 */
function createTestSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables for E2E tests. ' +
        'Ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY are set in .env.test file.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Gets the test user ID from environment variable.
 * This ID is used to scope database cleanup to only test user's data.
 */
function getTestUserId(): string {
  const userId = process.env.E2E_USER_ID;

  if (!userId) {
    throw new Error('Missing E2E_USER_ID environment variable. Set it in .env.test file.');
  }

  return userId;
}

/**
 * Extended Playwright test with database fixtures.
 *
 * Provides:
 * - `supabase`: Direct Supabase client for test data operations
 * - `testUserId`: The test user's ID for scoped operations
 * - `cleanDatabase`: Function to clean test user's data from database
 *
 * The cleanDatabase function:
 * - Only deletes data belonging to the test user (by user_id)
 * - Respects foreign key constraints (feedback → fixed_points → plans)
 * - Preserves profiles and auth tables needed for test user login
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const test = base.extend<TestFixtures>({
  // Worker-scoped Supabase client (shared across tests in same worker)
  supabase: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const client = createTestSupabaseClient();
      await use(client);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped test user ID
  testUserId: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const userId = getTestUserId();
      await use(userId);
    },
    { scope: 'worker' },
  ],

  // Override context to enable coverage collection
  context: async ({ context }, use) => {
    if (process.env.COLLECT_COVERAGE) {
      // Enable JS coverage
      await context.addInitScript(() => {
        // Mark that coverage should be collected
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__COVERAGE_ENABLED__ = true;
      });
    }
    await use(context);

    // Collect coverage after tests if enabled
    if (process.env.COLLECT_COVERAGE) {
      const coverageDir = path.join(process.cwd(), 'coverage-e2e', '.nyc_output');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      // Get all pages from context
      const pages = context.pages();
      for (const page of pages) {
        try {
          // Try to get coverage data if available
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coverage = await page.evaluate(() => (window as any).__coverage__);
          if (coverage) {
            const coverageFile = path.join(
              coverageDir,
              `coverage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`
            );
            fs.writeFileSync(coverageFile, JSON.stringify(coverage));
          }
        } catch {
          // Coverage not available, continue
        }
      }
    }
  },

  // Test-scoped cleanup function - deletes only test user's data
  cleanDatabase: async ({ supabase, testUserId }, use) => {
    const cleanup = async () => {
      // 1. Delete feedback for the test user
      const { error: feedbackError } = await supabase.from('feedback').delete().eq('user_id', testUserId);

      if (feedbackError) {
        throw new Error(`Failed to clean feedback: ${feedbackError.message}`);
      }

      // 2. Get all plan IDs for the test user (needed for fixed_points cleanup)
      const { data: userPlans, error: plansQueryError } = await supabase
        .from('plans')
        .select('id')
        .eq('user_id', testUserId);

      if (plansQueryError) {
        throw new Error(`Failed to query plans: ${plansQueryError.message}`);
      }

      // 3. Delete fixed_points for all user's plans
      if (userPlans && userPlans.length > 0) {
        const planIds = userPlans.map((plan) => plan.id);

        const { error: fixedPointsError } = await supabase.from('fixed_points').delete().in('plan_id', planIds);

        if (fixedPointsError) {
          throw new Error(`Failed to clean fixed_points: ${fixedPointsError.message}`);
        }
      }

      // 4. Delete plans for the test user
      const { error: plansError } = await supabase.from('plans').delete().eq('user_id', testUserId);

      if (plansError) {
        throw new Error(`Failed to clean plans: ${plansError.message}`);
      }
    };

    // Run cleanup before test
    await cleanup();

    // Provide the cleanup function to test if needed
    await use(cleanup);

    // Run cleanup after test as well (ensures clean state for next test)
    await cleanup();
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

export { expect } from '@playwright/test';
