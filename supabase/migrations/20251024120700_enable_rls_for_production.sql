/*
 * Migration: Re-enable RLS for production
 * 
 * Purpose: Restore secure Row Level Security policies before deploying to production
 * 
 * Tables affected: profiles, plans, fixed_points, feedback
 * 
 * ⚠️ CRITICAL: Run this migration before deploying to production!
 * 
 * Special notes:
 * - Removes permissive development policies
 * - Restores production-grade security policies
 * - Ensures users can only access their own data
 * - This migration reverses changes from 20251024120600
 */

-- ============================================================================
-- RE-ENABLE RLS POLICIES FOR: profiles
-- ============================================================================

-- Drop development policies
DROP POLICY IF EXISTS "profiles_dev_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_dev_insert_all" ON profiles;
DROP POLICY IF EXISTS "profiles_dev_update_all" ON profiles;
DROP POLICY IF EXISTS "profiles_dev_delete_all" ON profiles;

-- Restore production policies
CREATE POLICY "profiles_select_own"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
    ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

COMMENT ON POLICY "profiles_select_own" ON profiles IS 'Authenticated users can view only their own profile';
COMMENT ON POLICY "profiles_insert_own" ON profiles IS 'Authenticated users can create only their own profile';
COMMENT ON POLICY "profiles_update_own" ON profiles IS 'Authenticated users can update only their own profile';
COMMENT ON POLICY "profiles_delete_own" ON profiles IS 'Authenticated users can delete only their own profile';

-- ============================================================================
-- RE-ENABLE RLS POLICIES FOR: plans
-- ============================================================================

-- Drop development policies
DROP POLICY IF EXISTS "plans_dev_select_all" ON plans;
DROP POLICY IF EXISTS "plans_dev_insert_all" ON plans;
DROP POLICY IF EXISTS "plans_dev_update_all" ON plans;
DROP POLICY IF EXISTS "plans_dev_delete_all" ON plans;

-- Restore production policies
CREATE POLICY "plans_select_own"
    ON plans
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "plans_insert_own"
    ON plans
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plans_update_own"
    ON plans
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plans_delete_own"
    ON plans
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON POLICY "plans_select_own" ON plans IS 'Authenticated users can view only their own plans';
COMMENT ON POLICY "plans_insert_own" ON plans IS 'Authenticated users can create plans only for themselves';
COMMENT ON POLICY "plans_update_own" ON plans IS 'Authenticated users can update only their own plans';
COMMENT ON POLICY "plans_delete_own" ON plans IS 'Authenticated users can delete only their own plans';

-- ============================================================================
-- RE-ENABLE RLS POLICIES FOR: fixed_points
-- ============================================================================

-- Drop development policies
DROP POLICY IF EXISTS "fixed_points_dev_select_all" ON fixed_points;
DROP POLICY IF EXISTS "fixed_points_dev_insert_all" ON fixed_points;
DROP POLICY IF EXISTS "fixed_points_dev_update_all" ON fixed_points;
DROP POLICY IF EXISTS "fixed_points_dev_delete_all" ON fixed_points;

-- Restore production policies
CREATE POLICY "fixed_points_select_own"
    ON fixed_points
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "fixed_points_insert_own"
    ON fixed_points
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "fixed_points_update_own"
    ON fixed_points
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "fixed_points_delete_own"
    ON fixed_points
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "fixed_points_select_own" ON fixed_points IS 'Authenticated users can view fixed points only from their own plans';
COMMENT ON POLICY "fixed_points_insert_own" ON fixed_points IS 'Authenticated users can create fixed points only in their own plans';
COMMENT ON POLICY "fixed_points_update_own" ON fixed_points IS 'Authenticated users can update fixed points only in their own plans';
COMMENT ON POLICY "fixed_points_delete_own" ON fixed_points IS 'Authenticated users can delete fixed points only from their own plans';

-- ============================================================================
-- RE-ENABLE RLS POLICIES FOR: feedback
-- ============================================================================

-- Drop development policies
DROP POLICY IF EXISTS "feedback_dev_select_all" ON feedback;
DROP POLICY IF EXISTS "feedback_dev_insert_all" ON feedback;
DROP POLICY IF EXISTS "feedback_dev_update_all" ON feedback;
DROP POLICY IF EXISTS "feedback_dev_delete_all" ON feedback;

-- Restore production policies
CREATE POLICY "feedback_select_own"
    ON feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "feedback_insert_own"
    ON feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = feedback.plan_id
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "feedback_update_own"
    ON feedback
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_delete_own"
    ON feedback
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON POLICY "feedback_select_own" ON feedback IS 'Authenticated users can view only their own feedback';
COMMENT ON POLICY "feedback_insert_own" ON feedback IS 'Authenticated users can create feedback only for their own plans';
COMMENT ON POLICY "feedback_update_own" ON feedback IS 'Authenticated users can update only their own feedback';
COMMENT ON POLICY "feedback_delete_own" ON feedback IS 'Authenticated users can delete only their own feedback';

-- ============================================================================
-- PRODUCTION MODE ACTIVE
-- ============================================================================

/*
 * ✅ PRODUCTION MODE ACTIVE ✅
 * 
 * All RLS policies have been restored to production-grade security settings.
 * Users can now only access their own data.
 * 
 * Verification:
 * 1. Test that authenticated users can only see their own profiles
 * 2. Test that users cannot access other users' plans
 * 3. Test that users cannot modify other users' data
 * 
 * To verify policies are active:
 * SELECT schemaname, tablename, policyname, roles, cmd 
 * FROM pg_policies 
 * WHERE tablename IN ('profiles', 'plans', 'fixed_points', 'feedback');
 * 
 * Expected: All policies should end with "_own" (not "_dev_*_all")
 */

