import { Calendar, MapPin } from 'lucide-react';
import { formatDateRange } from '@/lib/utils/dateFormatters';

type PlanMetadataProps = {
  startDate?: string;
  endDate?: string;
  destination: string;
};

/**
 * Displays plan metadata (dates and destination)
 * Uses shared date formatting utilities
 */
export function PlanMetadata({ startDate, endDate, destination }: PlanMetadataProps) {
  return (
    <div className='mt-2 flex items-center gap-4 text-sm text-muted-foreground'>
      <div className='flex items-center gap-1'>
        <Calendar className='h-4 w-4' />
        <span>{formatDateRange(startDate, endDate)}</span>
      </div>
      <div className='flex items-center gap-1'>
        <MapPin className='h-4 w-4' />
        <span>{destination}</span>
      </div>
    </div>
  );
}
