import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { preferencesSchema, type PreferencesFormData } from '@/lib/schemas/preferences.schema';
import type { UpdateProfileCommand } from '@/types';

type UsePreferencesFormProps = {
  initialPreferences: string[] | null;
  initialTravelPace: PreferencesFormData['travel_pace'] | null;
  onSave: (data: UpdateProfileCommand) => Promise<void>;
};

/**
 * Custom hook for managing preferences form state and submission.
 * Handles form validation, change detection, and submission.
 *
 * @example
 * const { form, handleSubmit, hasChanges } = usePreferencesForm({
 *   initialPreferences: ['culture', 'food'],
 *   initialTravelPace: 'moderate',
 *   onSave: async (data) => await updateProfile(data)
 * });
 */
export function usePreferencesForm({ initialPreferences, initialTravelPace, onSave }: UsePreferencesFormProps) {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    mode: 'onChange',
    defaultValues: {
      preferences: initialPreferences || [],
      travel_pace: initialTravelPace || undefined,
    },
  });

  // Watch form values to detect changes
  const watchedPreferences = useWatch({ control: form.control, name: 'preferences' });
  const watchedTravelPace = useWatch({ control: form.control, name: 'travel_pace' });

  // Check if form has changes
  const hasChanges = useMemo(() => {
    const preferencesChanged =
      JSON.stringify(watchedPreferences?.sort() || []) !== JSON.stringify((initialPreferences || []).sort());
    const travelPaceChanged = watchedTravelPace !== initialTravelPace;

    return preferencesChanged || travelPaceChanged;
  }, [watchedPreferences, watchedTravelPace, initialPreferences, initialTravelPace]);

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSave({
        preferences: data.preferences,
        travel_pace: data.travel_pace,
      });
    } catch {
      // Error handling is done in the parent component
    }
  });

  const isValid = form.formState.isValid;

  return {
    form,
    handleSubmit,
    hasChanges,
    isValid,
  };
}
