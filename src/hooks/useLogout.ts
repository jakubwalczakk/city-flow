import { useState, useCallback } from 'react';
import { supabaseClient } from '@/db/supabase.client';

/**
 * Custom hook for managing user logout functionality.
 * Handles logout state, Supabase signOut, and redirect.
 *
 * @example
 * const { handleLogout, isLoggingOut } = useLogout();
 */
export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handles the logout process.
   * Signs out from Supabase and redirects to home page.
   */
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;

      // Redirect to home page after logout
      window.location.href = '/';
    } catch {
      setIsLoggingOut(false);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  }, []);

  return {
    handleLogout,
    isLoggingOut,
  };
}

/**
 * Gets user initials from email for avatar display.
 * @param email - User's email address
 * @returns Two-letter uppercase initials
 */
export function getUserInitials(email: string): string {
  const name = email.split('@')[0];
  return name.substring(0, 2).toUpperCase();
}
