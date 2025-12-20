import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

type EditableTitleProps = {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
};

/**
 * Editable title component with inline editing mode
 * Supports keyboard shortcuts (Enter to save, Escape to cancel)
 */
export function EditableTitle({ title, onSave }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    if (!editedName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedName);
      setIsEditing(false);
    } catch {
      // Reset to original name on error
      setEditedName(title);
    } finally {
      setIsSaving(false);
    }
  }, [editedName, onSave, title]);

  const handleCancel = useCallback(() => {
    setEditedName(title);
    setIsEditing(false);
  }, [title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

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
          <Button onClick={handleSave} disabled={!editedName.trim() || isSaving} size='sm'>
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
        onClick={() => setIsEditing(true)}
        className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded'
        aria-label='Edytuj nazwę planu'
      >
        <Pencil className='h-5 w-5 text-muted-foreground' />
      </button>
    </div>
  );
}
