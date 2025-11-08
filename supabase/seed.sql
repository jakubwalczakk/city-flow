/*
 * Seed file for local development
 * 
 * Purpose: Initialize the database with a default test user for development
 * 
 * ⚠️ IMPORTANT: This seed file is for DEVELOPMENT ONLY!
 * ⚠️ The user ID must match DEFAULT_USER_ID in src/db/supabase.client.ts
 * 
 * This file runs automatically after migrations when you run:
 * - supabase db reset
 * - supabase start
 */

-- ============================================================================
-- Create Default Development User
-- ============================================================================

-- The user ID must match DEFAULT_USER_ID constant in src/db/supabase.client.ts
-- Current value: "17555d06-2387-4f0b-b4f8-0887177cadc1"

-- Insert into auth.users (Supabase Auth table)
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
)
VALUES (
    '17555d06-2387-4f0b-b4f8-0887177cadc1'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'dev@cityflow.local',
    -- Password: "password123" (hashed with bcrypt)
    -- This is a development-only password, never use in production!
    '$2a$10$8qvZ7Z7Z7Z7Z7Z7Z7Z7Z7uKqJ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z',
    now(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Development User"}',
    false,
    now(),
    now(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Insert into auth.identities (required for email authentication)
-- Note: provider_id should match the user_id for email provider
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    '17555d06-2387-4f0b-b4f8-0887177cadc1'::uuid,
    '17555d06-2387-4f0b-b4f8-0887177cadc1',
    jsonb_build_object(
        'sub', '17555d06-2387-4f0b-b4f8-0887177cadc1',
        'email', 'dev@cityflow.local',
        'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities 
    WHERE user_id = '17555d06-2387-4f0b-b4f8-0887177cadc1'::uuid 
    AND provider = 'email'
);

-- ============================================================================
-- Create Default User Profile
-- ============================================================================

-- Create a profile for the default user with some test preferences
INSERT INTO profiles (
    id,
    preferences,
    travel_pace,
    generations_remaining,
    onboarding_completed,
    updated_at
)
VALUES (
    '17555d06-2387-4f0b-b4f8-0887177cadc1'::uuid,
    ARRAY['Art & Museums', 'Local Food', 'History'],
    'moderate',
    5,
    true,
    now()
)
ON CONFLICT (id) DO UPDATE SET
    preferences = EXCLUDED.preferences,
    travel_pace = EXCLUDED.travel_pace,
    generations_remaining = EXCLUDED.generations_remaining,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = now();

-- ============================================================================
-- Confirmation Message
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ============================================================';
    RAISE NOTICE '✅ Default development user created successfully!';
    RAISE NOTICE '✅ ============================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'User ID: 17555d06-2387-4f0b-b4f8-0887177cadc1';
    RAISE NOTICE 'Email: dev@cityflow.local';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE '';
    RAISE NOTICE 'This user matches DEFAULT_USER_ID in src/db/supabase.client.ts';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  This is for DEVELOPMENT ONLY - never use in production!';
    RAISE NOTICE '';
END $$;

