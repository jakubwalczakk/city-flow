import { useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { TravelPaceSelector } from '@/components/TravelPaceSelector';
import { PreferencesSelector } from '@/components/PreferencesSelector';
import { preferencesSchema, type PreferencesFormData } from '@/lib/schemas/preferences.schema';
import type { UpdateProfileCommand } from '@/types';

type PreferencesFormProps = {
  initialPreferences: string[] | null;
  initialTravelPace: PreferencesFormData['travel_pace'] | null;
  onSave: (data: UpdateProfileCommand) => Promise<void>;
  isSaving: boolean;
};

/**
 * Form for editing user preferences: travel pace and tourism tags.
 * Uses React Hook Form with Zod validation for form state management.
 */
export function PreferencesForm({ initialPreferences, initialTravelPace, onSave, isSaving }: PreferencesFormProps) {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    mode: 'onChange', // Enable onChange validation for better dirty detection
    defaultValues: {
      preferences: initialPreferences || [],
      travel_pace: initialTravelPace || undefined,
    },
  });

  // Watch form values to detect changes
  const watchedPreferences = useWatch({ control: form.control, name: 'preferences' });
  const watchedTravelPace = useWatch({ control: form.control, name: 'travel_pace' });

  // Check if form has changes manually
  const hasChanges = useMemo(() => {
    const preferencesChanged =
      JSON.stringify(watchedPreferences?.sort() || []) !== JSON.stringify((initialPreferences || []).sort());
    const travelPaceChanged = watchedTravelPace !== initialTravelPace;

    return preferencesChanged || travelPaceChanged;
  }, [watchedPreferences, watchedTravelPace, initialPreferences, initialTravelPace]);

  /**
   * Handles form submission.
   */
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

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Controller
        control={form.control}
        name='travel_pace'
        render={({ field, fieldState }) => (
          <div>
            <TravelPaceSelector value={field.value || null} onChange={field.onChange} />
            {fieldState.error && <p className='text-sm text-destructive mt-2'>{fieldState.error.message}</p>}
          </div>
        )}
      />

      <Controller
        control={form.control}
        name='preferences'
        render={({ field, fieldState }) => (
          <PreferencesSelector value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />

      <Button type='submit' disabled={!hasChanges || !form.formState.isValid || isSaving} className='w-full sm:w-auto'>
        {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
      </Button>
    </form>
  );
}
