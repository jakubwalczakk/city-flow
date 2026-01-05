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
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';

type EventTimelineProps = {
  items: TimelineItem[];
  currency?: string;
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (itemId: string) => void;
};

/**
 * Displays a timeline of items for a single day.
 * Shows time, title, description, location, type, and optional estimated cost/duration for each item.
 * Uses useDeleteConfirmation hook for delete dialog management.
 */
export default function EventTimeline({ items, currency = 'PLN', onEdit, onDelete }: EventTimelineProps) {
  const { isOpen, itemToDelete, openDialogById, closeDialog, confirmDelete } = useDeleteConfirmation<TimelineItem>({
    onConfirm: (item) => onDelete?.(item.id),
  });

  if (!items || items.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground' data-testid='empty-activities-message'>
        Brak zaplanowanych aktywności na ten dzień.
      </div>
    );
  }

  return (
    <div className='relative space-y-6 pl-8 pb-4' data-testid='plan-timeline'>
      {/* Timeline vertical line */}
      <div className='absolute left-[7px] top-2 bottom-0 w-0.5 bg-border' />

      {items.map((item) => (
        <TimelineItemComponent
          key={item.id}
          item={item}
          currency={currency}
          onEdit={onEdit}
          onDelete={onDelete ? (itemId) => openDialogById(items, itemId) : undefined}
        />
      ))}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń aktywność</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć &quot;{itemToDelete?.title}&quot;? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid='cancel-delete'>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              data-testid='confirm-delete'
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
