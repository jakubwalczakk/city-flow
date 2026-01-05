/* eslint-disable no-console */
import { chromium, FullConfig } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHARED_USER_PASSWORD = 'TestPass123!';

const SHARED_TEST_USERS = {
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

/**
 * Global setup that runs once before all tests.
 * Creates shared test users and saves their authentication state.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(_config: FullConfig) {
  console.log('🚀 Global Setup: Creating shared test users...');

  // Get from environment variables (playwright.config.ts sets these)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('  ❌ Missing SUPABASE_URL or SUPABASE_KEY');
    console.error('  Make sure .env.test is loaded correctly');
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Ensure storage directory exists
  const storageDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Create each shared user
  const userEntries = Object.entries(SHARED_TEST_USERS);
  let createdCount = 0;
  let existingCount = 0;

  for (const [key, email] of userEntries) {
    try {
      // Try to sign in first
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password: SHARED_USER_PASSWORD,
      });

      if (signInData.user) {
        console.log(`  ✓ User ${key} already exists`);
        existingCount++;

        // Update profile to ensure it's ready
        await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            generations_used: 0,
          })
          .eq('id', signInData.user.id);

        // Clean any existing data
        await cleanUserData(supabase, signInData.user.id);
      } else {
        // User doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: SHARED_USER_PASSWORD,
          options: {
            emailRedirectTo: `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/auth/callback`,
            data: {
              email_confirmed: true,
            },
          },
        });

        if (signUpError || !signUpData.user) {
          throw new Error(`Failed to create user ${key}: ${signUpError?.message}`);
        }

        console.log(`  ✓ Created user ${key}`);
        createdCount++;

        // Set up profile
        await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            travel_pace: 'moderate',
            preferences: ['culture', 'food', 'sightseeing'],
            generations_used: 0,
          })
          .eq('id', signUpData.user.id);

        // Wait to avoid rate limiting on user creation
        console.log(`  ⏳ Waiting 3s to avoid rate limiting...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Create storage state for this user (for browser authentication)
      await createStorageState(email, SHARED_USER_PASSWORD, key, storageDir);

      // Small delay between operations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Error setting up user ${key}:`, error);
      // Continue with next user even if one fails
    }
  }

  console.log(`✅ Global Setup Complete:`);
  console.log(`   - Created: ${createdCount} users`);
  console.log(`   - Existing: ${existingCount} users`);
  console.log(`   - Total: ${createdCount + existingCount} users ready`);
}

/**
 * Clean all data for a user while keeping the account
 */
async function cleanUserData(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  // Delete feedback
  await supabase.from('feedback').delete().eq('user_id', userId);

  // Get all plan IDs
  const { data: plans } = await supabase.from('plans').select('id').eq('user_id', userId);
  const planIds = plans?.map((p) => p.id) ?? [];

  if (planIds.length > 0) {
    // Delete related data
    await supabase.from('fixed_points').delete().in('plan_id', planIds);
    await supabase.from('feedback').delete().in('plan_id', planIds);
  }

  // Delete plans
  await supabase.from('plans').delete().eq('user_id', userId);
}

/**
 * Create browser storage state for authenticated user
 */
async function createStorageState(email: string, password: string, userKey: string, storageDir: string): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4321';
    await page.goto(`${baseURL}/login`);

    // Fill login form
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(/\/plans|\//, { timeout: 10000 });

    // Handle onboarding modal if it appears
    const onboardingModal = page.locator('[data-testid="onboarding-modal"]');
    const isOnboardingVisible = await onboardingModal.isVisible().catch(() => false);

    if (isOnboardingVisible) {
      const skipButton = page.locator('[data-testid="skip-onboarding"]');
      await skipButton.click();
      await page.waitForTimeout(500);
    }

    // Save storage state
    const storagePath = path.join(storageDir, `${userKey}.json`);
    await context.storageState({ path: storagePath });

    console.log(`  💾 Saved storage state for ${userKey}`);
  } catch (error) {
    console.error(`  ⚠️  Failed to create storage state for ${userKey}:`, error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
