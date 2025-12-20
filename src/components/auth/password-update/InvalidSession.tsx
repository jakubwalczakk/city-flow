import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Error state shown when password recovery link is expired or invalid.
 */
export function InvalidSession() {
  return (
    <div className='w-full max-w-md space-y-6'>
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <p className='font-medium'>Link wygasł lub jest nieprawidłowy</p>
          <p className='mt-2 text-sm'>Ten link do resetowania hasła wygasł lub został już użyty. Poproś o nowy link.</p>
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
