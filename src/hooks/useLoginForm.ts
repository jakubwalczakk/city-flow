import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';

type UseLoginFormProps = {
  onSuccess?: () => void;
};

/**
 * Custom hook for managing login form state and submission.
 * Extracts form logic from LoginForm component following clean architecture.
 *
 * @example
 * const { form, onSubmit, isLoading, error, success } = useLoginForm({
 *   onSuccess: () => console.log('Logged in!')
 * });
 */
export function useLoginForm({ onSuccess }: UseLoginFormProps = {}) {
  const { login, isLoading, error, success } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await login(data);
      onSuccess?.();
    } catch {
      // Error already handled by useAuth hook
    }
  });

  return {
    form,
    onSubmit,
    isLoading,
    error,
    success,
  };
}
