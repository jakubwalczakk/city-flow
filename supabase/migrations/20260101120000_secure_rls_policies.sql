/*
 * Migration: Secure RLS Policies (Robust)
 * 
 * Purpose: Define and enable Row Level Security policies for production.
 *          Clean up any development or previous production policies to ensure a clean state.
 * 
 * Tables affected: profiles, plans, fixed_points, feedback
 */

-- ============================================================================
-- CLEANUP: Remove potential existing policies (both Dev and Prod versions)
-- ============================================================================

DO $$ 
DECLARE 
    tables TEXT[] := ARRAY['profiles', 'plans', 'fixed_points', 'feedback'];
    t TEXT;
    policies TEXT[] := ARRAY['select', 'insert', 'update', 'delete'];
    p TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Remove Dev policies
        DROP POLICY IF EXISTS "profiles_dev_select_all" ON profiles;
        DROP POLICY IF EXISTS "profiles_dev_insert_all" ON profiles;
        DROP POLICY IF EXISTS "profiles_dev_update_all" ON profiles;
        DROP POLICY IF EXISTS "profiles_dev_delete_all" ON profiles;
        
        DROP POLICY IF EXISTS "plans_dev_select_all" ON plans;
        DROP POLICY IF EXISTS "plans_dev_insert_all" ON plans;
        DROP POLICY IF EXISTS "plans_dev_update_all" ON plans;
        DROP POLICY IF EXISTS "plans_dev_delete_all" ON plans;

        DROP POLICY IF EXISTS "fixed_points_dev_select_all" ON fixed_points;
        DROP POLICY IF EXISTS "fixed_points_dev_insert_all" ON fixed_points;
        DROP POLICY IF EXISTS "fixed_points_dev_update_all" ON fixed_points;
        DROP POLICY IF EXISTS "fixed_points_dev_delete_all" ON fixed_points;

        DROP POLICY IF EXISTS "feedback_dev_select_all" ON feedback;
        DROP POLICY IF EXISTS "feedback_dev_insert_all" ON feedback;
        DROP POLICY IF EXISTS "feedback_dev_update_all" ON feedback;
        DROP POLICY IF EXISTS "feedback_dev_delete_all" ON feedback;

        -- Remove Production policies (to avoid "already exists" errors when recreating)
        DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
        DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
        DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
        DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

        DROP POLICY IF EXISTS "plans_select_own" ON plans;
        DROP POLICY IF EXISTS "plans_insert_own" ON plans;
        DROP POLICY IF EXISTS "plans_update_own" ON plans;
        DROP POLICY IF EXISTS "plans_delete_own" ON plans;

        DROP POLICY IF EXISTS "fixed_points_select_own" ON fixed_points;
        DROP POLICY IF EXISTS "fixed_points_insert_own" ON fixed_points;
        DROP POLICY IF EXISTS "fixed_points_update_own" ON fixed_points;
        DROP POLICY IF EXISTS "fixed_points_delete_own" ON fixed_points;

        DROP POLICY IF EXISTS "feedback_select_own" ON feedback;
        DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
        DROP POLICY IF EXISTS "feedback_update_own" ON feedback;
        DROP POLICY IF EXISTS "feedback_delete_own" ON feedback;
    END LOOP;
END $$;

-- ============================================================================
-- ENABLE RLS POLICIES FOR: profiles
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- ============================================================================
-- ENABLE RLS POLICIES FOR: plans
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- ============================================================================
-- ENABLE RLS POLICIES FOR: fixed_points
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE fixed_points ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- ============================================================================
-- ENABLE RLS POLICIES FOR: feedback
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
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

