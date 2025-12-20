import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

/**
 * Success state shown after password has been updated.
 * Automatically redirects to login page after 2 seconds.
 */
export function PasswordUpdateSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='w-full max-w-md space-y-6'>
      <Alert className='border-green-500 bg-green-50 text-green-900'>
        <CheckCircle2 className='h-4 w-4' />
        <AlertDescription>
          <p className='font-medium'>Hasło zostało zmienione!</p>
          <p className='mt-2 text-sm'>Twoje hasło zostało pomyślnie zaktualizowane. Przekierowywanie do logowania...</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
