import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuth } from '@/hooks/useAuth';

type LoginFormProps = {
  onSuccess?: () => void;
};

/**
 * Login form component with email and password fields.
 * Uses React Hook Form with Zod validation and auth service for API calls.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
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

  return (
    <div className='w-full max-w-md space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-500 bg-green-50 text-green-900'>
          <CheckCircle2 className='h-4 w-4' />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} method='post' className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='twoj.email@example.com'
                    disabled={isLoading}
                    data-testid='auth-email-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <PasswordInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Wprowadź hasło'
                    disabled={isLoading}
                    data-testid='auth-password-input'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end'>
            <a href='/forgot-password' className='text-sm text-primary hover:underline'>
              Zapomniałeś hasła?
            </a>
          </div>

          <Button type='submit' className='w-full' disabled={isLoading} data-testid='auth-submit-btn'>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Zaloguj się
          </Button>
        </form>
      </Form>

      <div className='text-center text-sm text-muted-foreground'>
        <p>
          Nie masz konta?{' '}
          <a href='/register' className='text-primary hover:underline'>
            Zarejestruj się
          </a>
        </p>
      </div>
    </div>
  );
}
