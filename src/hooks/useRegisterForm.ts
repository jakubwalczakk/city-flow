import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';

type UseRegisterFormProps = {
  onSuccess?: () => void;
};

/**
 * Custom hook for managing registration form state and submission.
 * Extracts form logic from RegisterForm component following clean architecture.
 *
 * @example
 * const { form, onSubmit, isLoading, error, success } = useRegisterForm({
 *   onSuccess: () => console.log('Registered!')
 * });
 */
export function useRegisterForm({ onSuccess }: UseRegisterFormProps = {}) {
  const { register: authRegister, isLoading, error, success } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await authRegister(data);
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
