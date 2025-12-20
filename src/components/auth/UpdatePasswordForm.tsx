import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/schemas/auth.schema';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { supabaseClient } from '@/db/supabase.client';

/**
 * Update password form component.
 * Allows users to set a new password after clicking the reset link.
 */
export function UpdatePasswordForm() {
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { updatePassword, isLoading, error } = useAuth();

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verify password recovery session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check if user has a valid session (password recovery)
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (session) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
        }
      } catch {
        setIsValidSession(false);
      }
    };

    verifySession();
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updatePassword(data.password);
      setSuccess(true);
    } catch {
      // Error already handled by useAuth hook
    }
  });

  // Redirect to login after successful password update
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  // Loading state while verifying session
  if (isValidSession === null) {
    return (
      <div className='w-full max-w-md space-y-6'>
        <div className='flex flex-col items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='mt-4 text-sm text-muted-foreground'>Weryfikacja sesji...</p>
        </div>
      </div>
    );
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className='w-full max-w-md space-y-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <p className='font-medium'>Link wygasł lub jest nieprawidłowy</p>
            <p className='mt-2 text-sm'>
              Ten link do resetowania hasła wygasł lub został już użyty. Poproś o nowy link.
            </p>
          </AlertDescription>
        </Alert>

        <div className='text-center'>
          <a href='/forgot-password' className='inline-block text-sm text-primary hover:underline'>
            Wyślij nowy link resetujący
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className='w-full max-w-md space-y-6'>
        <Alert className='border-green-500 bg-green-50 text-green-900'>
          <CheckCircle2 className='h-4 w-4' />
          <AlertDescription>
            <p className='font-medium'>Hasło zostało zmienione!</p>
            <p className='mt-2 text-sm'>
              Twoje hasło zostało pomyślnie zaktualizowane. Przekierowywanie do logowania...
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Form
  return (
    <div className='w-full max-w-md space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nowe hasło</FormLabel>
                <FormControl>
                  <PasswordInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Minimum 8 znaków'
                    disabled={isLoading}
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
                <FormLabel>Potwierdź nowe hasło</FormLabel>
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

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Ustaw nowe hasło
          </Button>
        </form>
      </Form>
    </div>
  );
}
