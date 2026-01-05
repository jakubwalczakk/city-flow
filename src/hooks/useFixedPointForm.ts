import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fixedPointSchema, type FixedPointFormData } from '@/lib/schemas/plan.schema';
import type { FixedPointFormItem } from '@/types';
import { updateDateKeepTime, updateTimeKeepDate, getDateFromISO, getTimeFromISO } from '@/lib/utils/dateFormatters';

type UseFixedPointFormProps = {
  onAdd: (point: FixedPointFormItem) => void;
  onUpdate: (index: number, point: FixedPointFormItem) => void;
};

/**
 * Custom hook for managing fixed point form state and validation
 * Uses React Hook Form with Zod validation
 */
export function useFixedPointForm({ onAdd, onUpdate }: UseFixedPointFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<FixedPointFormData>({
    resolver: zodResolver(fixedPointSchema),
    mode: 'onChange', // Validate on change to update isValid in real-time
    defaultValues: {
      location: '',
      event_at: '',
      event_duration: undefined,
      description: '',
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      location: '',
      event_at: '',
      event_duration: undefined,
      description: '',
    });
    setIsAdding(false);
    setEditingIndex(null);
  }, [form]);

  const startAdding = useCallback(() => {
    resetForm();
    setIsAdding(true);
  }, [resetForm]);

  const startEditing = useCallback(
    (index: number, point: FixedPointFormItem) => {
      setEditingIndex(index);
      setIsAdding(false);
      form.reset({
        ...point,
        event_at: point.event_at ? new Date(point.event_at).toISOString() : '',
      });
    },
    [form]
  );

  const handleSubmit = useCallback(
    (data: FixedPointFormData) => {
      // Convert form data to FixedPointFormItem (without ID - it will be preserved by parent)
      const pointToSubmit: FixedPointFormItem = {
        location: data.location,
        event_at: data.event_at ? new Date(data.event_at).toISOString() : '',
        event_duration: data.event_duration,
        description: data.description ?? null,
      };

      if (editingIndex !== null) {
        onUpdate(editingIndex, pointToSubmit);
      } else {
        onAdd(pointToSubmit);
      }

      resetForm();
    },
    [editingIndex, onAdd, onUpdate, resetForm]
  );

  const onSubmit = form.handleSubmit(handleSubmit);

  // Date/time handlers for the form
  const eventAt = form.watch('event_at');

  /**
   * Get the date value for the DatePicker component
   */
  const getDateForPicker = useCallback((): Date | undefined => {
    return getDateFromISO(eventAt);
  }, [eventAt]);

  /**
   * Get the time value for the time input
   */
  const getTimeForInput = useCallback((): string => {
    return getTimeFromISO(eventAt);
  }, [eventAt]);

  /**
   * Handle date selection from DatePicker
   */
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        form.setValue('event_at', updateDateKeepTime(eventAt, date), { shouldValidate: true });
      }
    },
    [form, eventAt]
  );

  /**
   * Handle time change from time input
   */
  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue('event_at', updateTimeKeepDate(eventAt, e.target.value), { shouldValidate: true });
    },
    [form, eventAt]
  );

  return {
    form,
    isAdding,
    editingIndex,
    startAdding,
    startEditing,
    resetForm,
    onSubmit,
    // Date/time helpers
    getDateForPicker,
    getTimeForInput,
    handleDateSelect,
    handleTimeChange,
  };
}
