import { Loader2, AlertTriangle, FileQuestion, ChevronLeft, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StateViewProps = {
  className?: string;
};

type ErrorViewProps = StateViewProps & {
  title?: string;
  message: string;
  backHref?: string;
  backLabel?: string;
};

type NotFoundViewProps = StateViewProps & {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
};

type LoadingViewProps = StateViewProps & {
  message?: string;
};

/**
 * Loading state view with spinner
 */
export function LoadingView({ message = 'Ładowanie...', className = '' }: LoadingViewProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className='text-center'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
        <p className='mt-4 text-muted-foreground'>{message}</p>
      </div>
    </div>
  );
}

/**
 * Error state view with icon and back link
 */
export function ErrorView({
  title = 'Wystąpił błąd',
  message,
  backHref = '/plans',
  backLabel = '← Powrót do planów',
  className = '',
}: ErrorViewProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className='text-center max-w-md'>
        <div className='mb-4'>
          <AlertTriangle className='mx-auto h-12 w-12 text-destructive' aria-hidden='true' />
        </div>
        <h2 className='text-xl font-semibold mb-2'>{title}</h2>
        <p className='text-muted-foreground mb-6'>{message}</p>
        <Button asChild>
          <a href={backHref}>{backLabel}</a>
        </Button>
      </div>
    </div>
  );
}

/**
 * Not found state view with icon and back link
 */
export function NotFoundView({
  title = 'Nie znaleziono',
  message = 'Szukany element nie istnieje lub został usunięty.',
  backHref = '/plans',
  backLabel = '← Powrót do planów',
  className = '',
}: NotFoundViewProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className='text-center max-w-md'>
        <div className='mb-4'>
          <FileQuestion className='mx-auto h-12 w-12 text-muted-foreground' aria-hidden='true' />
        </div>
        <h2 className='text-xl font-semibold mb-2'>{title}</h2>
        <p className='text-muted-foreground mb-6'>{message}</p>
        <Button asChild>
          <a href={backHref}>{backLabel}</a>
        </Button>
      </div>
    </div>
  );
}

type BackLinkProps = {
  href?: string;
  label?: string;
};

/**
 * Back navigation link component
 */
export function BackLink({ href = '/plans', label = 'Powrót do planów' }: BackLinkProps) {
  return (
    <a
      href={href}
      className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
    >
      <ChevronLeft className='h-4 w-4' />
      {label}
    </a>
  );
}

/**
 * Archived plan banner
 */
export function ArchivedBanner() {
  return (
    <div className='bg-muted/50 border border-muted rounded-lg p-4 mb-6 flex items-center gap-3 text-muted-foreground'>
      <Archive className='h-5 w-5' aria-hidden='true' />
      <p className='text-sm font-medium'>To jest plan archiwalny. Edycja jest zablokowana.</p>
    </div>
  );
}
