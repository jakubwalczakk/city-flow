import { memo } from 'react';
import type { TimelineItem as TimelineItemType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, MapPin, Clock } from 'lucide-react';
import { getCategoryIcon, getCategoryLabel } from '@/lib/constants/timelineCategories';

type TimelineItemProps = {
  item: TimelineItemType;
  currency: string;
  onEdit?: (item: TimelineItemType) => void;
  onDelete?: (itemId: string) => void;
};

/**
 * Single timeline item component
 * Displays activity details with optional edit/delete actions
 * Memoized to prevent unnecessary re-renders
 */
function TimelineItemComponent({ item, currency, onEdit, onDelete }: TimelineItemProps) {
  const CategoryIcon = getCategoryIcon(item.category);

  return (
    <div className='relative'>
      {/* Timeline dot */}
      <div className='absolute -left-[29px] top-1.5 flex h-4 w-4 items-center justify-center'>
        <div className='h-3 w-3 rounded-full border-2 border-primary bg-background' />
      </div>

      {/* Item card */}
      <div className='rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 min-w-0 space-y-2'>
            <div className='flex items-center gap-2 mb-2 flex-wrap'>
              {/* Time badge */}
              {item.time && (
                <div className='inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary'>
                  <Clock className='h-3 w-3' />
                  {item.time}
                </div>
              )}

              {/* Category badge */}
              <Badge variant='outline' className='inline-flex items-center gap-1.5'>
                <CategoryIcon className='h-3 w-3' />
                {getCategoryLabel(item.category)}
              </Badge>
            </div>

            {/* Title */}
            <h4 className='font-semibold text-base'>{item.title}</h4>

            {/* Location */}
            {item.location && (
              <div className='flex items-start gap-1.5 text-sm text-muted-foreground'>
                <MapPin className='h-4 w-4 mt-0.5 flex-shrink-0' />
                <span>{item.location}</span>
              </div>
            )}

            {/* Description */}
            {item.description && <p className='text-sm text-muted-foreground leading-relaxed'>{item.description}</p>}

            {/* Notes */}
            {item.notes && (
              <div className='mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground border-l-2 border-primary/50'>
                <span className='font-medium'>Notatka:</span> {item.notes}
              </div>
            )}
          </div>

          <div className='flex-shrink-0 flex items-start gap-2'>
            {/* Estimated cost */}
            {item.estimated_price && item.estimated_price !== '0' && (
              <div className='rounded-md bg-muted px-3 py-1.5 text-sm font-medium'>
                {item.estimated_price} {currency}
              </div>
            )}

            {/* Actions menu */}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreVertical className='h-4 w-4' />
                    <span className='sr-only'>Otwórz menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className='mr-2 h-4 w-4' />
                      Edytuj
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(item.id)}
                      className='text-destructive focus:text-destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Usuń
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export const TimelineItem = memo(TimelineItemComponent);
