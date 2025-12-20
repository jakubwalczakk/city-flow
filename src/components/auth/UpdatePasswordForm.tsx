import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordRecoverySession } from '@/hooks/usePasswordRecoverySession';
import {
  SessionVerifying,
  InvalidSession,
  PasswordUpdateSuccess,
  PasswordUpdateForm,
} from '@/components/auth/password-update';

/**
 * Update password form component.
 * Allows users to set a new password after clicking the reset link.
 *
 * Flow:
 * 1. Verify session → Show loading
 * 2. Invalid session → Show error with link to request new reset
 * 3. Valid session → Show password form
 * 4. Success → Show confirmation and redirect to login
 */
export function UpdatePasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { isVerifying, isInvalid } = usePasswordRecoverySession();
  const { updatePassword, isLoading, error } = useAuth();

  const handleSubmit = async (password: string) => {
    try {
      await updatePassword(password);
      setIsSuccess(true);
    } catch {
      // Error already handled by useAuth hook
    }
  };

  // Early returns for different states (happy path last)
  if (isVerifying) {
    return <SessionVerifying />;
  }

  if (isInvalid) {
    return <InvalidSession />;
  }

  if (isSuccess) {
    return <PasswordUpdateSuccess />;
  }

  return <PasswordUpdateForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />;
}
