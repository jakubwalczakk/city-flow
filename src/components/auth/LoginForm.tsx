import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useLoginForm } from '@/hooks/useLoginForm';

type LoginFormProps = {
  onSuccess?: () => void;
};

/**
 * Login form component with email and password fields.
 * Uses useLoginForm hook for form state and validation.
 * Follows clean architecture with separation of logic and presentation.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const { form, onSubmit, isLoading, error, success } = useLoginForm({ onSuccess });

  return (
    <div className='w-full max-w-md space-y-6'>
      {error && (
        <Alert variant='destructive' data-testid='error-alert'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-500 bg-green-50 text-green-900' data-testid='success-alert'>
          <CheckCircle2 className='h-4 w-4' />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <h1 data-testid='auth-heading' className='text-2xl font-bold text-center'>
        Witaj ponownie
      </h1>

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
            <a href='/forgot-password' className='text-sm text-primary hover:underline' data-testid='forgot-password-link'>
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
          <a href='/register' className='text-primary hover:underline' data-testid='register-link'>
            Zarejestruj się
          </a>
        </p>
      </div>
    </div>
  );
}
