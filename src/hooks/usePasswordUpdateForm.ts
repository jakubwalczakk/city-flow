import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/schemas/auth.schema';

type UsePasswordUpdateFormOptions = {
  onSubmit: (password: string) => Promise<void>;
};

/**
 * Custom hook for password update form logic
 * Encapsulates form state management and validation
 */
export function usePasswordUpdateForm({ onSubmit }: UsePasswordUpdateFormOptions) {
  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data.password);
  });

  return {
    form,
    handleSubmit,
  };
}
