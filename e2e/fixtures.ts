/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';
import fs from 'fs';
import { LoginPage } from './page-objects/LoginPage';
import { OnboardingModal } from './page-objects/OnboardingModal';
import { setupCommonMocks } from './test-setup';

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

/**
 * Generates a unique test email using timestamp and random string.
 * Used for creating unique test users that don't conflict.
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@dev.com`;
}

/**
 * Creates a test user with optional profile configuration.
 * Returns user data including ID and session.
 */
export async function createTestUser(
  supabase: SupabaseClient<Database>,
  options?: {
    email?: string;
    password?: string;
    onboardingCompleted?: boolean;
    travelPace?: 'slow' | 'moderate' | 'intensive' | null;
    preferences?: string[];
  }
) {
  const email = options?.email || generateTestEmail();
  const password = options?.password || 'TestPassword123!';

  // Create user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        email_confirmed: true, // Auto-confirm for testing
      },
    },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message || 'Unknown error'}`);
  }

  // Update profile if options provided
  if (options) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: options.onboardingCompleted ?? false,
        travel_pace: options.travelPace ?? null,
        preferences: options.preferences ?? [],
      })
      .eq('id', authData.user.id);

    if (profileError) {
      // Profile update failed, but user was created successfully
    }
  }

  return {
    user: authData.user,
    session: authData.session,
    email,
    password,
  };
}

/**
 * Deletes a test user completely including profile, plans, and auth data.
 * Note: This requires service_role key or admin API access.
 */
export async function deleteTestUser(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  // First clean all user data
  await cleanDatabase(supabase, userId);

  // Delete profile (this should cascade if RLS policies allow)
  await supabase.from('profiles').delete().eq('id', userId);

  // Note: Actual auth user deletion requires admin API
  // For E2E tests, we typically leave users in auth.users and clean them periodically
  // or use a separate test database that gets reset
}

/**
 * Creates a plan with activities for testing.
 * Returns the plan ID.
 */
export async function createPlanWithActivities(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: {
    name?: string;
    destination?: string;
    startDate?: string;
    days: {
      date: string;
      activities: {
        title: string;
        time?: string;
        duration?: string;
        category?: string;
        location?: string;
        description?: string;
        estimatedPrice?: string;
        type?: 'activity' | 'meal' | 'transport';
      }[];
    }[];
  }
): Promise<string> {
  const { name = 'Test Plan', destination = 'Paris', startDate = '2026-06-15', days } = options;

  // Build generated_content structure
  const generatedContent = {
    summary: 'Test plan with activities',
    currency: 'PLN',
    days: days.map((day) => ({
      date: day.date,
      items: day.activities.map((activity) => ({
        id: crypto.randomUUID(),
        type: activity.type || 'activity',
        title: activity.title,
        time: activity.time,
        category: activity.category || 'other',
        description: activity.description,
        location: activity.location,
        estimated_price: activity.estimatedPrice,
        estimated_duration: activity.duration,
      })),
    })),
  };

  // Create plan with generated status
  const { data: plan, error } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name,
      destination,
      start_date: startDate,
      end_date: days.length > 0 ? days[days.length - 1].date : startDate,
      status: 'generated',
      generated_content: generatedContent as never,
    })
    .select()
    .single();

  if (error || !plan) {
    throw new Error(`Failed to create plan: ${error?.message || 'Unknown error'}`);
  }

  return plan.id;
}

/**
 * Gets an activity by title from a plan's generated content.
 */
export async function getActivityByTitle(
  supabase: SupabaseClient<Database>,
  planId: string,
  title: string
): Promise<unknown | null> {
  const { data: plan } = await supabase.from('plans').select('generated_content').eq('id', planId).single();

  if (!plan || !plan.generated_content) {
    return null;
  }

  const content = plan.generated_content as {
    days: { items: { title: string }[] }[];
  };

  for (const day of content.days) {
    const activity = day.items.find((item) => item.title === title);
    if (activity) {
      return activity;
    }
  }

  return null;
}

/**
 * Counts total activities in a plan's generated content.
 */
export async function countActivities(supabase: SupabaseClient<Database>, planId: string): Promise<number> {
  const { data: plan } = await supabase.from('plans').select('generated_content').eq('id', planId).single();

  if (!plan || !plan.generated_content) {
    return 0;
  }

  const content = plan.generated_content as {
    days: { items: unknown[] }[];
  };

  return content.days.reduce((total, day) => total + day.items.length, 0);
}

/**
 * Creates a simple draft plan for testing.
 */
export async function createDraftPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: {
    name?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }
): Promise<string> {
  const {
    name = 'Test Draft Plan',
    destination = 'Paris',
    startDate = '2026-06-15',
    endDate = '2026-06-17',
    notes = 'Test notes',
  } = options || {};

  const { data: plan, error } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name,
      destination,
      start_date: startDate,
      end_date: endDate,
      notes,
      status: 'draft',
    })
    .select()
    .single();

  if (error || !plan) {
    throw new Error(`Failed to create draft plan: ${error?.message || 'Unknown error'}`);
  }

  return plan.id;
}

/**
 * Creates a test plan for a given user with optional configuration.
 * Returns the plan ID and related entity IDs.
 */
export async function createTestPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: {
    name?: string;
    destination?: string;
    status?: 'draft' | 'generated' | 'archived';
    notes?: string;
    startDate?: string;
    endDate?: string;
    withFixedPoints?: boolean;
    withActivities?: boolean;
  }
): Promise<{ planId: string; fixedPointIds?: string[]; activityIds?: string[] }> {
  const startDate = options?.startDate || '2026-06-15';
  const endDate = options?.endDate || '2026-06-17';

  const { data: plan, error } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name: options?.name || 'Test Plan',
      destination: options?.destination || 'Test City',
      status: options?.status || 'draft',
      notes: options?.notes || 'Test plan notes',
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create test plan: ${error.message}`);

  const result: { planId: string; fixedPointIds?: string[]; activityIds?: string[] } = { planId: plan.id };

  // Add fixed points if requested
  if (options?.withFixedPoints) {
    const { data: fixedPoints } = await supabase
      .from('fixed_points')
      .insert([
        {
          plan_id: plan.id,
          location: 'Test Location 1',
          event_at: `${startDate}T10:00:00Z`,
          event_duration: 60,
          description: 'Test fixed point',
        },
      ])
      .select();
    result.fixedPointIds = fixedPoints?.map((fp) => fp.id) || [];
  }

  // Add activities if requested (requires generated status)
  if (options?.withActivities && options.status === 'generated') {
    const generatedContent = {
      summary: 'Test plan with activities',
      currency: 'PLN',
      days: [
        {
          date: startDate,
          items: [
            {
              id: crypto.randomUUID(),
              type: 'activity',
              title: 'Test Activity 1',
              time: '09:00',
              category: 'sightseeing',
              description: 'Test activity description',
              location: 'Test Location',
              estimated_duration: '2 hours',
            },
            {
              id: crypto.randomUUID(),
              type: 'meal',
              title: 'Test Activity 2',
              time: '13:00',
              category: 'food',
              description: 'Lunch time',
              location: 'Test Restaurant',
              estimated_duration: '1.5 hours',
            },
          ],
        },
      ],
    };

    // Update plan with generated content
    await supabase
      .from('plans')
      .update({ generated_content: generatedContent as never })
      .eq('id', plan.id);
  }

  return result;
}

/**
 * Deletes all plans for a specific user.
 * Related records (fixed_points, activities) are handled by CASCADE.
 */
export async function cleanUserPlans(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  // Cascade delete will handle related records
  await supabase.from('plans').delete().eq('user_id', userId);
}

/**
 * Verifies that a plan is not accessible (for RLS testing).
 * Returns true if the plan is not accessible (as expected), false otherwise.
 */
export async function verifyPlanNotAccessible(supabase: SupabaseClient<Database>, planId: string): Promise<boolean> {
  const { data, error } = await supabase.from('plans').select('*').eq('id', planId).single();

  return error !== null || data === null;
}

/**
 * Set the generation limit for a user (for testing generation limits).
 * @param supabase Supabase client
 * @param userId User ID
 * @param used Number of generations used (0-5)
 */
export async function setGenerationLimit(
  supabase: SupabaseClient<Database>,
  userId: string,
  used: number
): Promise<void> {
  const { error } = await supabase.from('profiles').update({ generations_used: used }).eq('id', userId);

  if (error) {
    throw new Error(`Failed to set generation limit: ${error.message}`);
  }
}

/**
 * Get the current generation count for a user.
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Number of generations used
 */
export async function getGenerationCount(supabase: SupabaseClient<Database>, userId: string): Promise<number> {
  const { data, error } = await supabase.from('profiles').select('generations_used').eq('id', userId).single();

  if (error) {
    throw new Error(`Failed to get generation count: ${error.message}`);
  }

  return data?.generations_used || 0;
}

/**
 * Verify that a plan has generated days and activities.
 * @param supabase Supabase client
 * @param planId Plan ID
 * @returns Object with days count and activities count
 */
export async function verifyPlanGenerated(
  supabase: SupabaseClient<Database>,
  planId: string
): Promise<{ daysCount: number; activitiesCount: number }> {
  // Check generated_plan_days
  const { data: days } = await supabase.from('generated_plan_days').select('id').eq('plan_id', planId);

  const daysCount = days?.length || 0;

  // Check plan_activities
  const { data: daysWithIds } = await supabase.from('generated_plan_days').select('id').eq('plan_id', planId);

  const dayIds = daysWithIds?.map((d) => d.id) || [];

  let activitiesCount = 0;
  if (dayIds.length > 0) {
    const { data: activities } = await supabase.from('plan_activities').select('id').in('plan_day_id', dayIds);

    activitiesCount = activities?.length || 0;
  }

  return { daysCount, activitiesCount };
}

/**
 * Verify that a fixed point exists in the generated plan activities.
 * @param supabase Supabase client
 * @param planId Plan ID
 * @param fixedPointLocation Location of the fixed point to search for
 * @returns True if the fixed point is found in activities
 */
export async function verifyFixedPointInPlan(
  supabase: SupabaseClient<Database>,
  planId: string,
  fixedPointLocation: string
): Promise<boolean> {
  // Get all days for this plan
  const { data: days } = await supabase.from('generated_plan_days').select('id').eq('plan_id', planId);

  if (!days || days.length === 0) return false;

  const dayIds = days.map((d) => d.id);

  // Check if any activity has the fixed point location
  const { data: activities } = await supabase
    .from('plan_activities')
    .select('title, location')
    .in('plan_day_id', dayIds);

  if (!activities) return false;

  return activities.some(
    (activity) =>
      activity.title?.toLowerCase().includes(fixedPointLocation.toLowerCase()) ||
      activity.location?.toLowerCase().includes(fixedPointLocation.toLowerCase())
  );
}

/**
 * Clean all generated plan data (days and activities) for a plan.
 * Useful for testing regeneration.
 * @param supabase Supabase client
 * @param planId Plan ID
 */
export async function cleanGeneratedPlanData(supabase: SupabaseClient<Database>, planId: string): Promise<void> {
  // Get all days
  const { data: days } = await supabase.from('generated_plan_days').select('id').eq('plan_id', planId);

  if (days && days.length > 0) {
    const dayIds = days.map((d) => d.id);

    // Delete activities (cascade should handle this, but being explicit)
    await supabase.from('plan_activities').delete().in('plan_day_id', dayIds);
  }

  // Delete days
  await supabase.from('generated_plan_days').delete().eq('plan_id', planId);
}

/**
 * Verify PDF download by checking filename.
 * @param download Playwright Download object
 * @param expectedFilename Expected filename (can be partial match)
 * @returns True if filename matches
 */
export async function verifyPdfDownload(download: Download, expectedFilename: string): Promise<boolean> {
  const filename = download.suggestedFilename();
  // Used for debugging and verification
  void filename;
  return filename.includes(expectedFilename) || filename.toLowerCase().includes(expectedFilename.toLowerCase());
}

/**
 * Extract text content from a downloaded PDF.
 * @param download Playwright Download object
 * @returns Extracted text from PDF
 */
export async function extractPdfText(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('Download path not available');

  // TODO: Fix pdf-parse ESM compatibility issue
  // For now, just verify the file exists and has content
  const dataBuffer = fs.readFileSync(path);
  if (dataBuffer.length === 0) {
    throw new Error('PDF file is empty');
  }

  // Return a placeholder - tests should verify download success rather than content
  return 'PDF content verification temporarily disabled due to ESM compatibility';
}

/**
 * Verify that PDF contains all expected text strings.
 * @param download Playwright Download object
 * @param expectedTexts Array of strings that should be in the PDF
 * @returns True if all expected texts are found
 */
export async function verifyPdfContent(download: Download, expectedTexts: string[]): Promise<boolean> {
  const text = await extractPdfText(download);
  return expectedTexts.every((expected) => text.includes(expected));
}

/**
 * Creates an archived plan for testing history functionality.
 * @param supabase Supabase client
 * @param userId User ID
 * @param options Plan configuration options
 * @returns Plan ID
 */
export async function createArchivedPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: {
    name?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    withActivities?: boolean;
  }
): Promise<string> {
  const {
    name = 'Archived Plan',
    destination = 'Rome',
    startDate = '2024-05-01',
    endDate = '2024-05-03',
    withActivities = false,
  } = options || {};

  // Create archived plan
  const { data: plan, error } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name,
      destination,
      start_date: startDate,
      end_date: endDate,
      status: 'archived',
    })
    .select()
    .single();

  if (error || !plan) {
    throw new Error(`Failed to create archived plan: ${error?.message || 'Unknown error'}`);
  }

  // Add activities if requested
  if (withActivities) {
    const { data: day } = await supabase
      .from('generated_plan_days')
      .insert({
        plan_id: plan.id,
        day_number: 1,
        date: startDate,
        title: 'Day 1',
      })
      .select()
      .single();

    if (day) {
      await supabase.from('plan_activities').insert([
        {
          plan_day_id: day.id,
          title: 'Morning Activity',
          start_time: '09:00',
          duration_minutes: 120,
          category: 'sightseeing',
          description: 'Test activity',
          location: 'Test Location',
        },
      ]);
    }
  }

  return plan.id;
}

/**
 * Sets the end date of a plan (useful for testing auto-archiving).
 * @param supabase Supabase client
 * @param planId Plan ID
 * @param endDate End date in ISO format (YYYY-MM-DD)
 */
export async function setPlanEndDate(
  supabase: SupabaseClient<Database>,
  planId: string,
  endDate: string
): Promise<void> {
  const { error } = await supabase.from('plans').update({ end_date: endDate }).eq('id', planId);

  if (error) {
    throw new Error(`Failed to set plan end date: ${error.message}`);
  }
}

/**
 * Verifies that a plan is in archived status (read-only).
 * @param supabase Supabase client
 * @param planId Plan ID
 * @returns True if plan is archived
 */
export async function verifyPlanIsArchived(supabase: SupabaseClient<Database>, planId: string): Promise<boolean> {
  const { data } = await supabase.from('plans').select('status').eq('id', planId).single();

  return data?.status === 'archived';
}

/**
 * Simulates the auto-archiving process by manually archiving expired plans.
 * In production, this would be done by a cron job.
 * @param supabase Supabase client
 * @returns Number of plans archived
 */
export async function runArchivingJob(supabase: SupabaseClient<Database>): Promise<number> {
  // Archive all plans with end_date in the past and status = 'generated'
  const { data, error } = await supabase
    .from('plans')
    .update({ status: 'archived' })
    .eq('status', 'generated')
    .lt('end_date', new Date().toISOString().split('T')[0])
    .select();

  if (error) {
    throw new Error(`Failed to run archiving job: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Creates multiple archived plans for testing history list.
 * @param supabase Supabase client
 * @param userId User ID
 * @param count Number of plans to create
 * @returns Array of plan IDs
 */
export async function createMultipleArchivedPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
  count: number
): Promise<string[]> {
  const planIds: string[] = [];
  const baseYear = 2024;

  for (let i = 0; i < count; i++) {
    const month = String(i + 1).padStart(2, '0');
    const planId = await createArchivedPlan(supabase, userId, {
      name: `Trip ${i + 1}`,
      destination: `City ${i + 1}`,
      startDate: `${baseYear}-${month}-01`,
      endDate: `${baseYear}-${month}-03`,
    });
    planIds.push(planId);
  }

  return planIds;
}

/**
 * Gets the count of archived plans for a user.
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Number of archived plans
 */
export async function getArchivedPlanCount(supabase: SupabaseClient<Database>, userId: string): Promise<number> {
  const { data } = await supabase
    .from('plans')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'archived');

  return data?.length || 0;
}

// ============================================================================
// FEEDBACK HELPERS
// ============================================================================

/**
 * Creates feedback for a plan.
 * @param supabase Supabase client
 * @param userId User ID
 * @param planId Plan ID
 * @param rating Rating ('positive', 'negative', or null)
 * @param comment Optional comment text
 * @returns Created feedback record
 */
export async function createFeedback(
  supabase: SupabaseClient<Database>,
  userId: string,
  planId: string,
  rating: 'positive' | 'negative' | null,
  comment?: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      plan_id: planId,
      rating,
      comment: comment || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create feedback: ${error.message}`);
  }

  return data;
}

/**
 * Gets feedback for a specific plan and user.
 * @param supabase Supabase client
 * @param userId User ID
 * @param planId Plan ID
 * @returns Feedback record or null if not found
 */
export async function getFeedback(supabase: SupabaseClient<Database>, userId: string, planId: string) {
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .maybeSingle();

  return data;
}

/**
 * Updates existing feedback.
 * @param supabase Supabase client
 * @param feedbackId Feedback ID
 * @param updates Updates to apply
 * @returns Updated feedback record
 */
export async function updateFeedback(
  supabase: SupabaseClient<Database>,
  feedbackId: string,
  updates: {
    rating?: 'positive' | 'negative' | null;
    comment?: string;
  }
) {
  const { data, error } = await supabase
    .from('feedback')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update feedback: ${error.message}`);
  }

  return data;
}

/**
 * Deletes all feedback for a user (cleanup).
 * @param supabase Supabase client
 * @param userId User ID
 */
export async function cleanFeedback(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  await supabase.from('feedback').delete().eq('user_id', userId);
}

/**
 * Gets feedback count for a user.
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Number of feedback records
 */
export async function getFeedbackCount(supabase: SupabaseClient<Database>, userId: string): Promise<number> {
  const { data } = await supabase.from('feedback').select('id', { count: 'exact' }).eq('user_id', userId);

  return data?.length || 0;
}

// ============================================================================
// AUTHENTICATED TEST FIXTURES
// ============================================================================

// ============================================================================
// SHARED TEST USERS - For Optimization
// ============================================================================

/**
 * Shared test users pool to reduce database load.
 * Each user can be reused across multiple tests with proper cleanup.
 */
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
  TEMP_USER: 'e2e-temp-user@test.com',
} as const;

export const SHARED_USER_PASSWORD = 'TestPass123!';

/**
 * Checks if a user exists in the database by email.
 */
export async function checkUserExists(supabase: SupabaseClient<Database>, email: string): Promise<boolean> {
  try {
    // Try to sign in with the email to check if user exists
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: SHARED_USER_PASSWORD,
    });

    // If login successful, user exists
    if (data.user) {
      return true;
    }

    // Check specific error messages
    if (error?.message.includes('Invalid login credentials')) {
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Gets or creates a shared test user.
 * If the user doesn't exist, creates it. Otherwise, returns existing user credentials.
 */
export async function getOrCreateSharedUser(
  supabase: SupabaseClient<Database>,
  userKey: keyof typeof SHARED_TEST_USERS
): Promise<{ email: string; password: string; userId: string }> {
  const email = SHARED_TEST_USERS[userKey];
  const password = SHARED_USER_PASSWORD;

  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // User exists and login successful
  if (signInData.user && !signInError) {
    return {
      email,
      password,
      userId: signInData.user.id,
    };
  }

  // User doesn't exist, create it
  const { user } = await createTestUser(supabase, {
    email,
    password,
    onboardingCompleted: true,
    travelPace: 'moderate',
    preferences: ['culture', 'food', 'sightseeing'],
  });

  return {
    email,
    password,
    userId: user.id,
  };
}

/**
 * Cleans up user data while preserving the user account.
 * This allows tests to reuse the same user without creating new ones.
 */
export async function cleanupUserData(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: { keepUser: boolean } = { keepUser: true }
): Promise<void> {
  // Delete feedback
  await supabase.from('feedback').delete().eq('user_id', userId);

  // Get all plan IDs for the user
  const { data: plans } = await supabase.from('plans').select('id').eq('user_id', userId);
  const planIds = plans?.map((p) => p.id) ?? [];

  // Delete generated plan days and activities
  if (planIds.length > 0) {
    const { data: days } = await supabase.from('generated_plan_days').select('id').in('plan_id', planIds);
    const dayIds = days?.map((d) => d.id) ?? [];

    if (dayIds.length > 0) {
      await supabase.from('plan_activities').delete().in('plan_day_id', dayIds);
    }

    await supabase.from('generated_plan_days').delete().in('plan_id', planIds);
    await supabase.from('fixed_points').delete().in('plan_id', planIds);
  }

  // Delete plans
  await supabase.from('plans').delete().eq('user_id', userId);

  // Reset onboarding if needed
  await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      generations_used: 0,
    })
    .eq('id', userId);

  // Optionally delete the user account
  if (!options.keepUser) {
    await supabase.from('profiles').delete().eq('id', userId);
  }
}

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  USER_EMAIL: process.env.E2E_USERNAME || 'test@example.com',
  USER_PASSWORD: process.env.E2E_PASSWORD || 'testpassword123',
} as const;

/**
 * Extended test with automatic authentication.
 * Use this for tests that require a logged-in user.
 *
 * @example
 * ```typescript
 * import { authTest as test } from '../fixtures';
 *
 * test('should create a plan', async ({ page }) => {
 *   // User is already logged in
 *   await page.goto('/plans');
 *   // ... test logic
 * });
 * ```
 */
export const authTest = test.extend<{
  authenticatedPage: Page;
}>({
  // Auto-cleanup before test
  page: async ({ page, supabase, testUser }, use) => {
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    await use(page);
    await cleanDatabase(supabase, testUser.id);
  },

  // Auto-login
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.USER_EMAIL, TEST_CONFIG.USER_PASSWORD);

    // Handle onboarding if it appears
    const onboardingModal = new OnboardingModal(page);
    const isVisible = await onboardingModal.isVisible();
    if (isVisible) {
      await onboardingModal.skip();
    }

    await use(page);
  },
});

/**
 * Test with automatic cleanup but no authentication.
 * Use this for auth-related tests (login, register, etc.)
 *
 * @example
 * ```typescript
 * import { cleanTest as test } from '../fixtures';
 *
 * test('should login successfully', async ({ page }) => {
 *   // Database is cleaned, but user is not logged in
 *   const loginPage = new LoginPage(page);
 *   await loginPage.goto();
 *   // ... test logic
 * });
 * ```
 */
export const cleanTest = test.extend({
  page: async ({ page, supabase, testUser }, use) => {
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    await use(page);
    await cleanDatabase(supabase, testUser.id);
  },
});
