import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fixedPointSchema } from '@/lib/schemas/plan.schema';
import type { CreateFixedPointCommand } from '@/types';

type UseFixedPointFormProps = {
  onAdd: (point: CreateFixedPointCommand) => void;
  onUpdate: (index: number, point: CreateFixedPointCommand) => void;
};

/**
 * Custom hook for managing fixed point form state and validation
 * Uses React Hook Form with Zod validation
 */
export function useFixedPointForm({ onAdd, onUpdate }: UseFixedPointFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<CreateFixedPointCommand>({
    resolver: zodResolver(fixedPointSchema),
    defaultValues: {
      location: '',
      event_at: '',
      event_duration: null,
      description: '',
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      location: '',
      event_at: '',
      event_duration: null,
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
    (index: number, point: CreateFixedPointCommand) => {
      setEditingIndex(index);
      setIsAdding(false);
      form.reset({
        ...point,
        event_at: point.event_at ? new Date(point.event_at).toISOString().slice(0, 16) : '',
      });
    },
    [form]
  );

  const handleSubmit = useCallback(
    (data: CreateFixedPointCommand) => {
      // Convert event_at to ISO string if it's not already
      const pointToSubmit = {
        ...data,
        event_at: data.event_at ? new Date(data.event_at).toISOString() : '',
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

  return {
    form,
    isAdding,
    editingIndex,
    startAdding,
    startEditing,
    resetForm,
    onSubmit,
  };
}
