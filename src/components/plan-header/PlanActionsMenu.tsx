import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreVertical, Archive, Trash2 } from 'lucide-react';
import { usePlanActionsMenu } from '@/hooks/usePlanActionsMenu';

type PlanActionsMenuProps = {
  planName: string;
  planStatus: string;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
};

/**
 * Dropdown menu with plan actions (archive, delete).
 * Uses usePlanActionsMenu hook for state and handlers.
 * Includes confirmation dialogs for destructive actions.
 */
export function PlanActionsMenu({ planName, planStatus, onArchive, onDelete }: PlanActionsMenuProps) {
  const { dialogs, loading, openDialog, closeDialog, handleDelete, handleArchive } = usePlanActionsMenu({
    onArchive,
    onDelete,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='icon'>
            <MoreVertical className='h-5 w-5' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {planStatus !== 'archived' && (
            <DropdownMenuItem onClick={() => openDialog('archive')}>
              <Archive className='mr-2 h-4 w-4' />
              Przenieś do historii
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={() => openDialog('delete')}>
            <Trash2 className='mr-2 h-4 w-4' />
            Usuń plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive confirmation dialog */}
      <AlertDialog open={dialogs.archive} onOpenChange={(open) => !open && closeDialog('archive')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Przenieść do historii?</AlertDialogTitle>
            <AlertDialogDescription>
              Plan zostanie przeniesiony do zakładki &quot;Historia&quot; i stanie się tylko do odczytu. Będziesz mógł
              go nadal przeglądać, ale nie będziesz mógł wprowadzać zmian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading.archive}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={loading.archive}>
              {loading.archive ? 'Przenoszenie...' : 'Przenieś'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={dialogs.delete} onOpenChange={(open) => !open && closeDialog('delete')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Plan &quot;{planName}&quot; oraz wszystkie powiązane dane zostaną trwale
              usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading.delete}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading.delete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {loading.delete ? 'Usuwanie...' : 'Usuń'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
