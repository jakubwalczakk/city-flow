import { Loader2 } from 'lucide-react';

/**
 * Loading state shown while verifying password recovery session.
 */
export function SessionVerifying() {
  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='flex flex-col items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='mt-4 text-sm text-muted-foreground'>Weryfikacja sesji...</p>
      </div>
    </div>
  );
}
