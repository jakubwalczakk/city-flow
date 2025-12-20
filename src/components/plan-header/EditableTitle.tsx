import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { useEditableTitle } from '@/hooks/useEditableTitle';

type EditableTitleProps = {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
};

/**
 * Editable title component with inline editing mode.
 * Supports keyboard shortcuts (Enter to save, Escape to cancel).
 * Uses useEditableTitle hook for state and logic management.
 */
export function EditableTitle({ title, onSave }: EditableTitleProps) {
  const {
    isEditing,
    editedName,
    setEditedName,
    isSaving,
    inputRef,
    startEditing,
    handleSave,
    handleCancel,
    handleKeyDown,
    canSave,
  } = useEditableTitle({ title, onSave });

  if (isEditing) {
    return (
      <div className='space-y-3'>
        <Input
          ref={inputRef}
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          placeholder='Nazwa planu'
          className='text-2xl font-bold h-auto py-2'
          onKeyDown={handleKeyDown}
        />
        <div className='flex gap-2'>
          <Button onClick={handleSave} disabled={!canSave} size='sm'>
            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
          <Button onClick={handleCancel} variant='outline' size='sm' disabled={isSaving}>
            Anuluj
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2 group'>
      <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
      <button
        onClick={startEditing}
        className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded'
        aria-label='Edytuj nazwę planu'
      >
        <Pencil className='h-5 w-5 text-muted-foreground' />
      </button>
    </div>
  );
}
