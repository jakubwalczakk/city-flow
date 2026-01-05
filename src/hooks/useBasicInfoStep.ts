import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicInfoSchema, type BasicInfoFormData } from '@/lib/schemas/plan.schema';
import type { NewPlanViewModel } from '@/types';

type UseBasicInfoStepProps = {
  formData: NewPlanViewModel['basicInfo'];
  updateFormData: (data: Partial<NewPlanViewModel['basicInfo']>) => void;
  goToNextStep: () => void;
  onSave: () => Promise<void>;
};

/**
 * Custom hook for managing BasicInfoStep form state and validation.
 * Uses react-hook-form with zod resolver for validation.
 */
export function useBasicInfoStep({ formData, updateFormData, goToNextStep, onSave }: UseBasicInfoStepProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: formData.name,
      destination: formData.destination,
      start_date: formData.start_date,
      end_date: formData.end_date,
      notes: formData.notes || '',
    },
    mode: 'onChange',
  });

  // Sync form values with parent state on blur
  const syncToParent = useCallback(() => {
    const values = form.getValues();
    updateFormData({
      name: values.name,
      destination: values.destination,
      start_date: values.start_date,
      end_date: values.end_date,
      notes: values.notes ?? '',
    });
  }, [form, updateFormData]);

  // Handle date selection with auto-open next picker
  const handleDateSelect = useCallback(
    (field: 'start_date' | 'end_date', date: Date | undefined) => {
      if (!date) return;

      const currentValue = form.getValues(field);
      const newDate = new Date(date);

      // Preserve existing time from current value
      newDate.setHours(currentValue.getHours());
      newDate.setMinutes(currentValue.getMinutes());

      form.setValue(field, newDate, { shouldValidate: true });
      updateFormData({ [field]: newDate });

      if (field === 'start_date') {
        setIsStartOpen(false);
        // Auto-open end date picker for better UX flow
        setIsEndOpen(true);
      } else {
        setIsEndOpen(false);
      }
    },
    [form, updateFormData]
  );

  // Handle time change
  const handleTimeChange = useCallback(
    (field: 'start_date' | 'end_date', timeStr: string) => {
      if (!timeStr) return;

      const [hours, minutes] = timeStr.split(':').map(Number);
      const currentDate = form.getValues(field);
      const newDate = new Date(currentDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);

      form.setValue(field, newDate, { shouldValidate: true });
      updateFormData({ [field]: newDate });
    },
    [form, updateFormData]
  );

  // Convert Date to time string (HH:mm) for input
  const dateToTime = useCallback((date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  // Handle form submission to proceed to next step
  const handleNext = form.handleSubmit(() => {
    syncToParent();
    goToNextStep();
  });

  // Handle save as draft
  const handleSave = form.handleSubmit(async () => {
    syncToParent();
    await onSave();
  });

  return {
    form,
    isStartOpen,
    setIsStartOpen,
    isEndOpen,
    setIsEndOpen,
    handleDateSelect,
    handleTimeChange,
    dateToTime,
    handleNext,
    handleSave,
    syncToParent,
  };
}
