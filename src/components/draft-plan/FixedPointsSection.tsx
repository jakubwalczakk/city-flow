import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import type { FixedPointDto } from '@/types';
import { formatDateTime } from '@/lib/utils/dateFormatters';

type FixedPointsSectionProps = {
  fixedPoints: FixedPointDto[];
  isLoading: boolean;
  onEdit: () => void;
};

/**
 * Displays fixed points in read-only mode with edit button
 */
export function FixedPointsSection({ fixedPoints, isLoading, onEdit }: FixedPointsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base'>Stałe punkty</CardTitle>
            <CardDescription>
              Zablokowane zobowiązania w twoim planie, takie jak loty, rezerwacje hotelowe lub bilety na wydarzenia.
            </CardDescription>
          </div>
          <Button onClick={onEdit} variant='outline' size='sm'>
            Edytuj plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Ładowanie stałych punktów...</p>
        ) : fixedPoints.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Nie dodano stałych punktów. Możesz edytować plan, aby je dodać.
          </p>
        ) : (
          <div className='space-y-3'>
            {fixedPoints.map((point) => (
              <div key={point.id} className='flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0'>
                <MapPin className='h-4 w-4 mt-1 text-muted-foreground flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='font-medium'>{point.location}</p>
                  {point.description && <p className='text-sm text-muted-foreground'>{point.description}</p>}
                  <div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    <span>{formatDateTime(point.event_at)}</span>
                    {point.event_duration > 0 && (
                      <>
                        <span>•</span>
                        <span>{point.event_duration} min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
