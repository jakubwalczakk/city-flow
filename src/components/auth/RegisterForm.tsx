import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useRegisterForm } from '@/hooks/useRegisterForm';

type RegisterFormProps = {
  onSuccess?: () => void;
};

/**
 * Registration form component with email, password, and password confirmation fields.
 * Uses useRegisterForm hook for form state and validation.
 * Follows clean architecture with separation of logic and presentation.
 */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { form, onSubmit, isLoading, error, success } = useRegisterForm({ onSuccess });

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
                    placeholder='Minimum 8 znaków'
                    disabled={isLoading}
                    data-testid='auth-password-input'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potwierdź hasło</FormLabel>
                <FormControl>
                  <PasswordInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Powtórz hasło'
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading} data-testid='auth-submit-btn'>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Zarejestruj się
          </Button>
        </form>
      </Form>

      <div className='text-center text-sm text-muted-foreground'>
        <p>
          Masz już konto?{' '}
          <a href='/login' className='text-primary hover:underline'>
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
