import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activitySchema, transformActivityFormData, type ActivityFormData } from '@/lib/schemas/activity.schema';
import { convertTo24Hour } from '@/lib/utils/timeFormatters';
import type { TimelineItem, TimelineItemCategory } from '@/types';

type UseActivityFormProps = {
  isOpen: boolean;
  initialData?: Partial<TimelineItem>;
  onSubmit: (activity: Partial<TimelineItem>) => Promise<void>;
  onClose: () => void;
};

const DEFAULT_VALUES: ActivityFormData = {
  title: '',
  time: '',
  category: 'other',
  location: '',
  description: '',
  estimated_price: '',
  estimated_duration: '',
};

/**
 * Prepare initial data for the form
 * Converts time format and parses duration
 */
function prepareInitialData(data: Partial<TimelineItem>): ActivityFormData {
  // Ensure time is in 24-hour format for the input
  let timeValue = data.time || '';
  if (timeValue && /AM|PM/i.test(timeValue)) {
    timeValue = convertTo24Hour(timeValue);
  }

  // Parse duration from "60 min" to "60"
  const durationValue = data.estimated_duration?.replace(/\D/g, '') || '';

  return {
    title: data.title || '',
    time: timeValue,
    category: (data.category as TimelineItemCategory) || 'other',
    location: data.location || '',
    description: data.description || '',
    estimated_price: data.estimated_price || '',
    estimated_duration: durationValue,
  };
}

/**
 * Custom hook for managing ActivityForm state and validation.
 * Uses react-hook-form with zod resolver.
 */
export function useActivityForm({ isOpen, initialData, onSubmit, onClose }: UseActivityFormProps) {
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const preparedData = prepareInitialData(initialData);
      form.reset(preparedData);
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, initialData, form]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (data: ActivityFormData) => {
      try {
        const transformedData = transformActivityFormData(data);
        await onSubmit(transformedData);
        onClose();
      } catch {
        // Error handling is done by the parent component
      }
    },
    [onSubmit, onClose]
  );

  const submitHandler = form.handleSubmit(handleFormSubmit);

  return {
    form,
    submitHandler,
    isSubmitting: form.formState.isSubmitting,
  };
}
