import { useState, useCallback } from 'react';

type UseDeleteConfirmationProps<T> = {
  onConfirm: (item: T) => void;
};

/**
 * Custom hook for managing delete confirmation dialog state.
 * Provides a reusable pattern for confirming destructive actions.
 *
 * @example
 * const { isOpen, itemToDelete, openDialog, closeDialog, confirmDelete } = useDeleteConfirmation({
 *   onConfirm: (item) => deleteItem(item.id)
 * });
 */
export function useDeleteConfirmation<T extends { id: string }>({ onConfirm }: UseDeleteConfirmationProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  /**
   * Opens the confirmation dialog for a specific item.
   */
  const openDialog = useCallback((item: T) => {
    setItemToDelete(item);
    setIsOpen(true);
  }, []);

  /**
   * Closes the confirmation dialog without deleting.
   */
  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setItemToDelete(null);
  }, []);

  /**
   * Confirms the deletion and calls the onConfirm callback.
   */
  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      onConfirm(itemToDelete);
    }
    closeDialog();
  }, [itemToDelete, onConfirm, closeDialog]);

  /**
   * Helper to open dialog by finding item in a list by ID.
   */
  const openDialogById = useCallback(
    (items: T[], itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        openDialog(item);
      }
    },
    [openDialog]
  );

  return {
    isOpen,
    itemToDelete,
    openDialog,
    openDialogById,
    closeDialog,
    confirmDelete,
  };
}
