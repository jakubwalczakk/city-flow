import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForgotPasswordForm } from '@/hooks/useForgotPasswordForm';

/**
 * Forgot password form component.
 * Allows users to request a password reset email.
 * Uses useForgotPasswordForm hook for state and logic management.
 */
export function ForgotPasswordForm() {
  const { form, onSubmit, isLoading, error, success, resetSuccess } = useForgotPasswordForm();

  if (success) {
    return (
      <div className='w-full max-w-md space-y-6'>
        <Alert className='border-green-500 bg-green-50 text-green-900'>
          <CheckCircle2 className='h-4 w-4' />
          <AlertDescription>
            <p className='font-medium'>Email został wysłany!</p>
            <p className='mt-2 text-sm'>
              Sprawdź swoją skrzynkę odbiorczą i kliknij w link, aby zresetować hasło. Link jest ważny przez 1 godzinę.
            </p>
          </AlertDescription>
        </Alert>

        <div className='text-center space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Nie otrzymałeś emaila?{' '}
            <button onClick={resetSuccess} className='text-primary hover:underline'>
              Spróbuj ponownie
            </button>
          </p>
          <a href='/login' className='inline-block text-sm text-primary hover:underline'>
            ← Powrót do logowania
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='twoj.email@example.com' disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Wyślij link resetujący
          </Button>
        </form>
      </Form>

      <div className='text-center space-y-2'>
        <p className='text-sm text-muted-foreground'>
          Pamiętasz hasło?{' '}
          <a href='/login' className='text-primary hover:underline'>
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
