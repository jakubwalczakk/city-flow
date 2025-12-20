import { useState, useCallback } from 'react';

type UsePlanActionsMenuProps = {
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
};

type DialogState = {
  delete: boolean;
  archive: boolean;
};

type LoadingState = {
  delete: boolean;
  archive: boolean;
};

/**
 * Custom hook for managing PlanActionsMenu dialog states and async handlers.
 * Extracts state management logic from PlanActionsMenu component.
 *
 * @example
 * const { dialogs, loading, openDialog, closeDialog, handleDelete, handleArchive } = usePlanActionsMenu({
 *   onDelete: async () => await deletePlan(),
 *   onArchive: async () => await archivePlan()
 * });
 */
export function usePlanActionsMenu({ onArchive, onDelete }: UsePlanActionsMenuProps) {
  const [dialogs, setDialogs] = useState<DialogState>({
    delete: false,
    archive: false,
  });

  const [loading, setLoading] = useState<LoadingState>({
    delete: false,
    archive: false,
  });

  const openDialog = useCallback((type: keyof DialogState) => {
    setDialogs((prev) => ({ ...prev, [type]: true }));
  }, []);

  const closeDialog = useCallback((type: keyof DialogState) => {
    setDialogs((prev) => ({ ...prev, [type]: false }));
  }, []);

  const handleDelete = useCallback(async () => {
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await onDelete();
      // Redirect to plans list after successful deletion
      window.location.href = '/plans';
    } catch {
      setLoading((prev) => ({ ...prev, delete: false }));
      closeDialog('delete');
    }
  }, [onDelete, closeDialog]);

  const handleArchive = useCallback(async () => {
    setLoading((prev) => ({ ...prev, archive: true }));
    try {
      await onArchive();
      closeDialog('archive');
    } catch {
      // Error handling could be improved with toast notifications
    } finally {
      setLoading((prev) => ({ ...prev, archive: false }));
    }
  }, [onArchive, closeDialog]);

  return {
    dialogs,
    loading,
    openDialog,
    closeDialog,
    handleDelete,
    handleArchive,
  };
}
