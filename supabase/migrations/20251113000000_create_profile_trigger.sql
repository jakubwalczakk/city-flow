/*
 * Migration: Create function for automatic profile creation
 * 
 * Purpose: Automatically create a profile record when a new user registers
 * 
 * Tables affected: profiles
 * 
 * Special notes:
 * - Function is called by Supabase Auth trigger (configured in Dashboard)
 * - Creates profile with default values (5 generations, onboarding not completed)
 * - Uses SECURITY DEFINER to bypass RLS policies during profile creation
 * 
 * IMPORTANT: After running this migration, you need to configure the trigger
 * in Supabase Dashboard:
 * 1. Go to Database → Triggers
 * 2. Create a new trigger on auth.users table
 * 3. Event: INSERT
 * 4. Function: public.handle_new_user()
 * 
 * OR use the SQL Editor with superuser privileges to create the trigger manually.
 */

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, generations_remaining, onboarding_completed)
  VALUES (
    NEW.id,
    5,  -- Default 5 free generations per month
    false  -- User hasn't completed onboarding yet
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile record when a new user signs up. Called by trigger on auth.users table.';

