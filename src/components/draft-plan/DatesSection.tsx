import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { formatDateTimeLong } from '@/lib/utils/dateFormatters';

type DatesSectionProps = {
  startDate: string;
  endDate: string;
};

/**
 * Displays plan dates (read-only)
 */
export function DatesSection({ startDate, endDate }: DatesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Daty i godziny podróży</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-3 text-sm'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground'>Początek</span>
              <span className='font-medium'>{formatDateTimeLong(startDate)}</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground'>Koniec</span>
              <span className='font-medium'>{formatDateTimeLong(endDate)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
