/*
 * Migration: Create profiles table with RLS policies
 * 
 * Purpose: Store user-specific application data linked to Supabase Auth
 * 
 * Tables affected: profiles (created)
 * 
 * Special notes:
 * - Profile ID matches auth.users(id) for 1:1 relationship
 * - Monthly generation limit resets via pg_cron (configured separately)
 * - RLS ensures users can only access their own profile
 */

-- Create profiles table
CREATE TABLE profiles (
    -- Primary key matching auth.users(id)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User travel preferences (2-5 tags required)
    preferences TEXT[] CHECK (array_length(preferences, 1) BETWEEN 2 AND 5),
    
    -- User's preferred travel pace
    travel_pace travel_pace_enum,
    
    -- Monthly free plan generation quota
    generations_remaining INTEGER NOT NULL DEFAULT 5 CHECK (generations_remaining >= 0),
    
    -- Onboarding completion status
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles with travel preferences and app-specific settings';
COMMENT ON COLUMN profiles.id IS 'User ID matching auth.users(id)';
COMMENT ON COLUMN profiles.preferences IS 'Array of 2-5 travel preference tags (e.g., culture, food, nightlife)';
COMMENT ON COLUMN profiles.travel_pace IS 'Preferred travel pace: slow, moderate, or intensive';
COMMENT ON COLUMN profiles.generations_remaining IS 'Number of free plan generations remaining this month';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed the onboarding flow';

-- Create index on preferences array for efficient searching
CREATE INDEX idx_profiles_preferences ON profiles USING GIN (preferences);

COMMENT ON INDEX idx_profiles_preferences IS 'GIN index for efficient array containment queries on preferences';

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own profile
CREATE POLICY "profiles_select_own"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

COMMENT ON POLICY "profiles_select_own" ON profiles IS 'Authenticated users can view only their own profile';

-- RLS Policy: Users can insert only their own profile
CREATE POLICY "profiles_insert_own"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_insert_own" ON profiles IS 'Authenticated users can create only their own profile';

-- RLS Policy: Users can update only their own profile
CREATE POLICY "profiles_update_own"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_update_own" ON profiles IS 'Authenticated users can update only their own profile';

-- RLS Policy: Users can delete only their own profile
CREATE POLICY "profiles_delete_own"
    ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

COMMENT ON POLICY "profiles_delete_own" ON profiles IS 'Authenticated users can delete only their own profile';

