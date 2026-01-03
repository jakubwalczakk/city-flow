import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

type WarningsCardProps = {
  warnings: string[];
};

/**
 * Displays AI-generated warnings and reminders
 */
export function WarningsCard({ warnings }: WarningsCardProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <Card
      className='border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20'
      data-testid='generation-warning'
    >
      <CardHeader>
        <div className='flex items-start gap-3'>
          <AlertTriangle className='h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0' />
          <div className='flex-1'>
            <CardTitle className='text-amber-900 dark:text-amber-100 text-base'>Ważne przypomnienia</CardTitle>
            <CardDescription className='text-amber-800 dark:text-amber-200 mt-1'>
              Przejrzyj te notatki przed podróżą
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {warnings.map((warning, index) => (
            <li key={index} className='text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2'>
              <span className='text-amber-600 dark:text-amber-500 mt-0.5'>•</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
