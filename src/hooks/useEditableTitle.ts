import { useState, useCallback, useEffect, useRef } from 'react';

type UseEditableTitleProps = {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
};

/**
 * Custom hook for managing editable title state and interactions.
 * Handles edit mode, keyboard shortcuts, focus management, and save/cancel actions.
 *
 * @example
 * const { isEditing, editedName, inputRef, ... } = useEditableTitle({ title, onSave });
 */
export function useEditableTitle({ title, onSave }: UseEditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update editedName when title prop changes (e.g., after external update)
  useEffect(() => {
    if (!isEditing) {
      setEditedName(title);
    }
  }, [title, isEditing]);

  /**
   * Starts the edit mode.
   */
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  /**
   * Handles saving the edited title.
   */
  const handleSave = useCallback(async () => {
    if (!editedName.trim()) return;

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

  /**
   * Handles canceling the edit mode.
   */
  const handleCancel = useCallback(() => {
    setEditedName(title);
    setIsEditing(false);
  }, [title]);

  /**
   * Handles keyboard shortcuts (Enter to save, Escape to cancel).
   */
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

  return {
    // State
    isEditing,
    editedName,
    setEditedName,
    isSaving,
    inputRef,

    // Actions
    startEditing,
    handleSave,
    handleCancel,
    handleKeyDown,

    // Computed
    canSave: editedName.trim().length > 0 && !isSaving,
  };
}
