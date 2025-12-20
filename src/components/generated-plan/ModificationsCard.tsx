import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

type ModificationsCardProps = {
  modifications: string[];
};

/**
 * Displays AI-generated plan modifications
 */
export function ModificationsCard({ modifications }: ModificationsCardProps) {
  if (!modifications || modifications.length === 0) {
    return null;
  }

  return (
    <Card className='border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20'>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <Info className='h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0' />
          <div className='flex-1'>
            <CardTitle className='text-blue-900 dark:text-blue-100 text-base'>Dostosowania planu</CardTitle>
            <CardDescription className='text-blue-800 dark:text-blue-200 mt-1'>
              Zmiany wprowadzone w celu optymalizacji planu
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {modifications.map((modification, index) => (
            <li key={index} className='text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2'>
              <span className='text-blue-600 dark:text-blue-500 mt-0.5'>•</span>
              <span>{modification}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
