import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { TravelPaceSelector } from '@/components/TravelPaceSelector';
import { PreferencesSelector } from '@/components/PreferencesSelector';
import { usePreferencesForm } from '@/hooks/usePreferencesForm';
import type { PreferencesFormData } from '@/lib/schemas/preferences.schema';
import type { UpdateProfileCommand } from '@/types';

type PreferencesFormProps = {
  initialPreferences: string[] | null;
  initialTravelPace: PreferencesFormData['travel_pace'] | null;
  onSave: (data: UpdateProfileCommand) => Promise<void>;
  isSaving: boolean;
};

/**
 * Form for editing user preferences: travel pace and tourism tags.
 * Uses usePreferencesForm hook for form state management.
 */
export function PreferencesForm({ initialPreferences, initialTravelPace, onSave, isSaving }: PreferencesFormProps) {
  const { form, handleSubmit, hasChanges, isValid } = usePreferencesForm({
    initialPreferences,
    initialTravelPace,
    onSave,
  });

  return (
    <form onSubmit={handleSubmit} className='space-y-6' data-testid='preferences-form'>
      <Controller
        control={form.control}
        name='travel_pace'
        render={({ field, fieldState }) => (
          <div data-testid='travel-pace-section'>
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

      <Button
        type='submit'
        disabled={!hasChanges || !isValid || isSaving}
        className='w-full sm:w-auto'
        data-testid='preferences-save-btn'
      >
        {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
      </Button>
    </form>
  );
}
