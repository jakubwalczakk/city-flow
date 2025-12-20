import { useState, useCallback } from 'react';
import type { TimelineItem } from '@/types';

type ActivityFormState = {
  isOpen: boolean;
  mode: 'add' | 'edit';
  date: string | null;
  item: TimelineItem | null;
};

const INITIAL_STATE: ActivityFormState = {
  isOpen: false,
  mode: 'add',
  date: null,
  item: null,
};

type UseActivityFormStateProps = {
  onAddActivity: (date: string, activity: Partial<TimelineItem>) => Promise<void>;
  onUpdateActivity: (date: string, itemId: string, activity: Partial<TimelineItem>) => Promise<void>;
  onDeleteActivity: (date: string, itemId: string) => Promise<void>;
};

/**
 * Custom hook for managing ActivityForm modal state in PlanDetailsView.
 * Handles opening, closing, and form submission for add/edit modes.
 */
export function useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }: UseActivityFormStateProps) {
  const [formState, setFormState] = useState<ActivityFormState>(INITIAL_STATE);

  const openAddForm = useCallback((date: string) => {
    setFormState({
      isOpen: true,
      mode: 'add',
      date,
      item: null,
    });
  }, []);

  const openEditForm = useCallback((date: string, item: TimelineItem) => {
    setFormState({
      isOpen: true,
      mode: 'edit',
      date,
      item,
    });
  }, []);

  const closeForm = useCallback(() => {
    setFormState(INITIAL_STATE);
  }, []);

  const handleFormSubmit = useCallback(
    async (activity: Partial<TimelineItem>) => {
      if (formState.mode === 'add' && formState.date) {
        await onAddActivity(formState.date, activity);
      } else if (formState.mode === 'edit' && formState.date && formState.item) {
        await onUpdateActivity(formState.date, formState.item.id, activity);
      }
    },
    [formState, onAddActivity, onUpdateActivity]
  );

  const handleDelete = useCallback(
    async (date: string, itemId: string) => {
      try {
        await onDeleteActivity(date, itemId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Nie udało się usunąć aktywności');
      }
    },
    [onDeleteActivity]
  );

  return {
    formState,
    openAddForm,
    openEditForm,
    closeForm,
    handleFormSubmit,
    handleDelete,
  };
}
