import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Pencil, Trash2 } from 'lucide-react';
import type { CreateFixedPointCommand } from '@/types';
import { formatDateTime } from '@/lib/utils/dateFormatters';

type FixedPointsListProps = {
  points: CreateFixedPointCommand[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  editingIndex: number | null;
};

/**
 * Displays a list of fixed points with edit/delete actions
 */
export function FixedPointsList({ points, onEdit, onRemove, editingIndex }: FixedPointsListProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <div className='space-y-3'>
      {points.map((point, index) => {
        // Skip rendering if this item is being edited (form will be shown instead)
        if (editingIndex === index) {
          return null;
        }

        return (
          <Card key={index}>
            <CardContent className='pt-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-start gap-2'>
                    <MapPin className='h-4 w-4 mt-1 text-muted-foreground' />
                    <div>
                      <p className='font-medium'>{point.location}</p>
                      {point.description && <p className='text-sm text-muted-foreground'>{point.description}</p>}
                    </div>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='h-4 w-4' />
                    <span>{formatDateTime(point.event_at)}</span>
                    {point.event_duration && (
                      <>
                        <span>•</span>
                        <span>{point.event_duration} minut</span>
                      </>
                    )}
                  </div>
                </div>
                <div className='flex items-center'>
                  <Button variant='ghost' size='icon' onClick={() => onEdit(index)}>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onRemove(index)}
                    className='text-destructive hover:text-destructive'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
