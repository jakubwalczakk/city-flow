import { useState, useCallback } from 'react';
import { supabaseClient } from '@/db/supabase.client';

/**
 * Custom hook for managing Google OAuth authentication.
 * Handles OAuth flow initiation, loading state, and errors.
 *
 * @example
 * const { handleGoogleAuth, isLoading, error } = useGoogleAuth();
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiates Google OAuth flow.
   * On success, user is redirected to Google for authentication.
   */
  const handleGoogleAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/plans`,
        },
      });

      if (authError) throw authError;

      // Note: User will be redirected to Google OAuth page
      // After successful auth, they'll return to /plans
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zainicjować logowania przez Google');
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the error state.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleGoogleAuth,
    isLoading,
    error,
    clearError,
  };
}
