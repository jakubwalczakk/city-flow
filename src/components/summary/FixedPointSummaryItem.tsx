import { memo } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/dateFormatters';
import type { FixedPointFormItem } from '@/types';

type FixedPointSummaryItemProps = {
  point: FixedPointFormItem;
};

/**
 * Displays a single fixed point in the summary view.
 * Shows location, description, date/time and duration.
 */
export const FixedPointSummaryItem = memo(function FixedPointSummaryItem({ point }: FixedPointSummaryItemProps) {
  return (
    <div className='flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0'>
      <MapPin className='h-4 w-4 mt-1 text-muted-foreground flex-shrink-0' />
      <div className='flex-1 min-w-0'>
        <p className='font-medium'>{point.location}</p>
        {point.description && <p className='text-sm text-muted-foreground'>{point.description}</p>}
        <div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
          <Clock className='h-3 w-3' />
          <span>{formatDateTime(point.event_at)}</span>
          {point.event_duration && (
            <>
              <span>•</span>
              <span>{point.event_duration} min</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
