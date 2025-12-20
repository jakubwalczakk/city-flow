import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { DateTimePickerField } from '@/components/ui/date-time-picker-field';
import { FormTextField, FormTextareaField, FormNumberField } from '@/components/ui/form-fields';
import type { FixedPointFormData } from '@/lib/schemas/plan.schema';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

type DateTimeHandlers = {
  getDateForPicker: () => Date | undefined;
  getTimeForInput: () => string;
  handleDateSelect: (date: Date | undefined) => void;
  handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type FixedPointFormProps = {
  form: UseFormReturn<FixedPointFormData>;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  dateTimeHandlers: DateTimeHandlers;
  isDatePickerOpen?: boolean;
  onDatePickerOpenChange?: (open: boolean) => void;
};

/**
 * Form component for adding/editing fixed points
 * Uses React Hook Form for validation and state management
 * Date/time logic is extracted to useFixedPointForm hook
 */
export function FixedPointForm({
  form,
  onSubmit,
  onCancel,
  isEditing,
  dateTimeHandlers,
  isDatePickerOpen = false,
  onDatePickerOpenChange,
}: FixedPointFormProps) {
  const { getDateForPicker, getTimeForInput, handleDateSelect, handleTimeChange } = dateTimeHandlers;
  const { isValid } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{isEditing ? 'Edytuj stały punkt' : 'Dodaj stały punkt'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <FormTextField
              control={form.control}
              name='location'
              label='Lokalizacja'
              placeholder='np. Lotnisko Chopina'
              required
              testId='fixed-point-location-input'
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <DateTimePickerField
                label='Data i godzina'
                date={getDateForPicker() ?? new Date()}
                timeValue={getTimeForInput()}
                onDateSelect={handleDateSelect}
                onTimeChange={(time) =>
                  handleTimeChange({ target: { value: time } } as React.ChangeEvent<HTMLInputElement>)
                }
                open={isDatePickerOpen}
                onOpenChange={onDatePickerOpenChange ?? noop}
                error={form.formState.errors.event_at?.message}
                required
                dateTestId='fixed-point-date-picker'
              />

              <FormNumberField
                control={form.control}
                name='event_duration'
                label='Czas trwania (minuty) - opcjonalnie'
                placeholder='np. 120'
                min={0}
              />
            </div>

            <FormTextareaField
              control={form.control}
              name='description'
              label='Opis (opcjonalnie)'
              placeholder='np. Przylot, zameldowanie w hotelu'
            />

            <div className='flex gap-2'>
              <Button type='submit' disabled={!isValid} className='flex-1' data-testid='save-fixed-point-btn'>
                {isEditing ? 'Zapisz zmiany' : 'Dodaj punkt'}
              </Button>
              <Button type='button' variant='outline' onClick={onCancel}>
                Anuluj
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
