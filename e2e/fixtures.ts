/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

type TestFixtures = {
  supabase: SupabaseClient<Database>;
  testUser: {
    id: string;
    email: string;
  };
};

export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  supabase: async ({}, use) => {
    const supabase = createTestSupabaseClient();
    await use(supabase);
  },
  // eslint-disable-next-line no-empty-pattern
  testUser: async ({}, use) => {
    const id = process.env.E2E_USER_ID;
    const email = process.env.E2E_USERNAME;

    if (!id || !email) {
      throw new Error('Missing E2E_USER_ID or E2E_USERNAME environment variable');
    }

    await use({ id, email });
  },
  page: async ({ page }, use) => {
    await page.coverage?.startJSCoverage();
    await use(page);
    const coverage = await page.coverage?.stopJSCoverage();
    if (coverage) {
      // Logic to save coverage would go here if needed,
      // but vite-plugin-istanbul handles it automatically via window.__coverage__
    }
  },
});

export { expect } from '@playwright/test';

/**
 * Creates a Supabase client for E2E test database operations.
 * Uses SUPABASE_URL and SUPABASE_KEY.
 */
function createTestSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables for E2E tests. ' +
        'Ensure SUPABASE_URL and SUPABASE_KEY are set in .env.test file.'
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
 * Cleans test data from the database for a specific user.
 * Removes plans, fixed_points, and feedback while preserving auth and profile data.
 */
export async function cleanDatabase(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  // Delete feedback
  await supabase.from('feedback').delete().eq('user_id', userId);

  // Get all plan IDs for the user
  const { data: plans } = await supabase.from('plans').select('id').eq('user_id', userId);
  const planIds = plans?.map((p) => p.id) ?? [];

  // Delete fixed points for those plans
  if (planIds.length > 0) {
    await supabase.from('fixed_points').delete().in('plan_id', planIds);
  }

  // Delete plans
  await supabase.from('plans').delete().eq('user_id', userId);
}
