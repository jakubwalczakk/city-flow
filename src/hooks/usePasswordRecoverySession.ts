import { useState, useEffect } from 'react';
import { supabaseClient } from '@/db/supabase.client';

type SessionStatus = 'verifying' | 'valid' | 'invalid';

/**
 * Hook to verify password recovery session on mount.
 * Checks if user has a valid session for password reset.
 */
export function usePasswordRecoverySession() {
  const [status, setStatus] = useState<SessionStatus>('verifying');

  useEffect(() => {
    const verifySession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        setStatus(session ? 'valid' : 'invalid');
      } catch {
        setStatus('invalid');
      }
    };

    verifySession();
  }, []);

  return {
    status,
    isVerifying: status === 'verifying',
    isValid: status === 'valid',
    isInvalid: status === 'invalid',
  };
}
