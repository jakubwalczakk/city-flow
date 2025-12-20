import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for managing forgot password form state and submission.
 * Handles form validation, API calls, and success state.
 *
 * @example
 * const { form, onSubmit, isLoading, error, success, resetSuccess } = useForgotPasswordForm();
 */
export function useForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handles form submission.
   */
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await resetPassword(data.email);
      setSuccess(true);
      form.reset();
    } catch {
      // Error already handled by useAuth hook
    }
  });

  /**
   * Resets the success state to allow retry.
   */
  const resetSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    form,
    onSubmit,
    isLoading,
    error,
    success,
    resetSuccess,
  };
}
