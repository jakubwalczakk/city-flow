/*
 * Migration: Temporarily disable RLS for development
 * 
 * Purpose: Disable Row Level Security policies during development for easier testing
 * 
 * Tables affected: profiles, plans, fixed_points, feedback
 * 
 * ⚠️ WARNING: This migration is for DEVELOPMENT ONLY!
 * ⚠️ DO NOT run this in production or staging environments!
 * ⚠️ Re-enable RLS before deploying to production using migration 20251024120700
 * 
 * Special notes:
 * - RLS tables remain enabled (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
 * - Policies are dropped, not just disabled
 * - This allows authenticated and anonymous users full access to all data
 * - Use migration 20251024120700_enable_rls_for_production.sql to re-enable
 */

-- ============================================================================
-- DISABLE RLS POLICIES FOR: profiles
-- ============================================================================

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

-- Create permissive policies for development (allow all operations)
CREATE POLICY "profiles_dev_select_all"
    ON profiles
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "profiles_dev_insert_all"
    ON profiles
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "profiles_dev_update_all"
    ON profiles
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "profiles_dev_delete_all"
    ON profiles
    FOR DELETE
    TO public
    USING (true);

COMMENT ON POLICY "profiles_dev_select_all" ON profiles IS '🚧 DEV ONLY: Allows all users to select any profile';
COMMENT ON POLICY "profiles_dev_insert_all" ON profiles IS '🚧 DEV ONLY: Allows all users to insert any profile';
COMMENT ON POLICY "profiles_dev_update_all" ON profiles IS '🚧 DEV ONLY: Allows all users to update any profile';
COMMENT ON POLICY "profiles_dev_delete_all" ON profiles IS '🚧 DEV ONLY: Allows all users to delete any profile';

-- ============================================================================
-- DISABLE RLS POLICIES FOR: plans
-- ============================================================================

-- Drop all existing policies on plans table
DROP POLICY IF EXISTS "plans_select_own" ON plans;
DROP POLICY IF EXISTS "plans_insert_own" ON plans;
DROP POLICY IF EXISTS "plans_update_own" ON plans;
DROP POLICY IF EXISTS "plans_delete_own" ON plans;

-- Create permissive policies for development (allow all operations)
CREATE POLICY "plans_dev_select_all"
    ON plans
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "plans_dev_insert_all"
    ON plans
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "plans_dev_update_all"
    ON plans
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "plans_dev_delete_all"
    ON plans
    FOR DELETE
    TO public
    USING (true);

COMMENT ON POLICY "plans_dev_select_all" ON plans IS '🚧 DEV ONLY: Allows all users to select any plan';
COMMENT ON POLICY "plans_dev_insert_all" ON plans IS '🚧 DEV ONLY: Allows all users to insert any plan';
COMMENT ON POLICY "plans_dev_update_all" ON plans IS '🚧 DEV ONLY: Allows all users to update any plan';
COMMENT ON POLICY "plans_dev_delete_all" ON plans IS '🚧 DEV ONLY: Allows all users to delete any plan';

-- ============================================================================
-- DISABLE RLS POLICIES FOR: fixed_points
-- ============================================================================

-- Drop all existing policies on fixed_points table
DROP POLICY IF EXISTS "fixed_points_select_own" ON fixed_points;
DROP POLICY IF EXISTS "fixed_points_insert_own" ON fixed_points;
DROP POLICY IF EXISTS "fixed_points_update_own" ON fixed_points;
DROP POLICY IF EXISTS "fixed_points_delete_own" ON fixed_points;

-- Create permissive policies for development (allow all operations)
CREATE POLICY "fixed_points_dev_select_all"
    ON fixed_points
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "fixed_points_dev_insert_all"
    ON fixed_points
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "fixed_points_dev_update_all"
    ON fixed_points
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "fixed_points_dev_delete_all"
    ON fixed_points
    FOR DELETE
    TO public
    USING (true);

COMMENT ON POLICY "fixed_points_dev_select_all" ON fixed_points IS '🚧 DEV ONLY: Allows all users to select any fixed point';
COMMENT ON POLICY "fixed_points_dev_insert_all" ON fixed_points IS '🚧 DEV ONLY: Allows all users to insert any fixed point';
COMMENT ON POLICY "fixed_points_dev_update_all" ON fixed_points IS '🚧 DEV ONLY: Allows all users to update any fixed point';
COMMENT ON POLICY "fixed_points_dev_delete_all" ON fixed_points IS '🚧 DEV ONLY: Allows all users to delete any fixed point';

-- ============================================================================
-- DISABLE RLS POLICIES FOR: feedback
-- ============================================================================

-- Drop all existing policies on feedback table
DROP POLICY IF EXISTS "feedback_select_own" ON feedback;
DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
DROP POLICY IF EXISTS "feedback_update_own" ON feedback;
DROP POLICY IF EXISTS "feedback_delete_own" ON feedback;

-- Create permissive policies for development (allow all operations)
CREATE POLICY "feedback_dev_select_all"
    ON feedback
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "feedback_dev_insert_all"
    ON feedback
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "feedback_dev_update_all"
    ON feedback
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "feedback_dev_delete_all"
    ON feedback
    FOR DELETE
    TO public
    USING (true);

COMMENT ON POLICY "feedback_dev_select_all" ON feedback IS '🚧 DEV ONLY: Allows all users to select any feedback';
COMMENT ON POLICY "feedback_dev_insert_all" ON feedback IS '🚧 DEV ONLY: Allows all users to insert any feedback';
COMMENT ON POLICY "feedback_dev_update_all" ON feedback IS '🚧 DEV ONLY: Allows all users to update any feedback';
COMMENT ON POLICY "feedback_dev_delete_all" ON feedback IS '🚧 DEV ONLY: Allows all users to delete any feedback';

-- ============================================================================
-- DEVELOPMENT WARNING
-- ============================================================================

/*
 * ⚠️  DEVELOPMENT MODE ACTIVE ⚠️
 * 
 * All RLS policies have been replaced with permissive policies that allow
 * unrestricted access to all data for all users (authenticated and anonymous).
 * 
 * This is ONLY for development purposes!
 * 
 * Before deploying to production:
 * 1. Run migration: 20251024120700_enable_rls_for_production.sql
 * 2. Test that RLS policies work correctly
 * 3. Verify that users can only access their own data
 * 
 * To check current policies:
 * SELECT schemaname, tablename, policyname, roles, cmd 
 * FROM pg_policies 
 * WHERE tablename IN ('profiles', 'plans', 'fixed_points', 'feedback');
 */

