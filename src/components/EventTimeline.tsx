import { useState } from 'react';
import type { TimelineItem } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TimelineItem as TimelineItemComponent } from '@/components/timeline/TimelineItem';

type EventTimelineProps = {
  items: TimelineItem[];
  currency?: string;
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (itemId: string) => void;
};

/**
 * Displays a timeline of items for a single day.
 * Shows time, title, description, location, type, and optional estimated cost/duration for each item.
 */
export default function EventTimeline({ items, currency = 'PLN', onEdit, onDelete }: EventTimelineProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TimelineItem | null>(null);

  const handleDeleteClick = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete.id);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (!items || items.length === 0) {
    return <div className='text-center py-8 text-muted-foreground'>Brak zaplanowanych aktywności na ten dzień.</div>;
  }

  return (
    <div className='relative space-y-6 pl-8 pb-4'>
      {/* Timeline vertical line */}
      <div className='absolute left-[7px] top-2 bottom-0 w-0.5 bg-border' />

      {items.map((item) => (
        <TimelineItemComponent
          key={item.id}
          item={item}
          currency={currency}
          onEdit={onEdit}
          onDelete={onDelete ? handleDeleteClick : undefined}
        />
      ))}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń aktywność</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć &quot;{itemToDelete?.title}&quot;? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
