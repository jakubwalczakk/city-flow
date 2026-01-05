/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';
import * as path from 'path';
import { setupCommonMocks } from './test-setup';
import { cleanDatabase } from './fixtures';

// Re-export expect for convenience
export { expect };

export const SHARED_TEST_USERS = {
  BASIC_USER: 'e2e-basic-user@test.com',
  PLAN_CREATOR: 'e2e-plan-creator@test.com',
  FEEDBACK_USER: 'e2e-feedback-user@test.com',
  HISTORY_USER: 'e2e-history-user@test.com',
  EXPORT_USER: 'e2e-export-user@test.com',
  RLS_USER_1: 'e2e-rls-user-1@test.com',
  RLS_USER_2: 'e2e-rls-user-2@test.com',
  PLAN_VIEWER: 'e2e-plan-viewer@test.com',
  PLAN_EDITOR: 'e2e-plan-editor@test.com',
} as const;

export type SharedUserKey = keyof typeof SHARED_TEST_USERS;

type SharedUserFixtures = {
  supabase: SupabaseClient<Database>;
  sharedUser: {
    email: string;
    id: string;
  };
};

/**
 * Create a test fixture that uses a specific shared user
 */
export function createSharedUserTest(userKey: SharedUserKey) {
  return base.extend<SharedUserFixtures>({
    // Supabase client
    supabase: async ({ browser }, use) => {
      void browser; // Playwright fixture parameter
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
      }

      const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      await use(supabase);
    },

    // Shared user info
    sharedUser: async ({ supabase }, use) => {
      const email = SHARED_TEST_USERS[userKey];

      // Get user ID
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password: 'TestPass123!',
      });

      if (!signInData.user) {
        throw new Error(`Shared user ${userKey} not found. Did global-setup run?`);
      }

      await use({
        email,
        id: signInData.user.id,
      });
    },

    // Page with storage state and cleanup
    page: async ({ page, supabase, sharedUser }, use) => {
      // Clean database before test
      await cleanDatabase(supabase, sharedUser.id);

      // Setup mocks
      await setupCommonMocks(page);

      // Use the page (already authenticated via storage state)
      await use(page);

      // Clean database after test
      await cleanDatabase(supabase, sharedUser.id);
    },
  });
}

/**
 * Pre-configured test fixtures for each shared user
 */
export const historyTest = createSharedUserTest('HISTORY_USER');
export const planCreatorTest = createSharedUserTest('PLAN_CREATOR');
export const planViewerTest = createSharedUserTest('PLAN_VIEWER');
export const planEditorTest = createSharedUserTest('PLAN_EDITOR');
export const feedbackTest = createSharedUserTest('FEEDBACK_USER');
export const exportTest = createSharedUserTest('EXPORT_USER');

/**
 * Get storage state path for a shared user
 */
export function getStorageStatePath(userKey: SharedUserKey): string {
  return path.join(__dirname, '.auth', `${userKey}.json`);
}
