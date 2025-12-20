import { test as base } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

type TestFixtures = {
  supabase: SupabaseClient<Database>;
  testUserId: string;
  cleanDatabase: () => Promise<void>;
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(cleanup);

    // Run cleanup after test as well (ensures clean state for next test)
    await cleanup();
  },
});

export { expect } from '@playwright/test';
