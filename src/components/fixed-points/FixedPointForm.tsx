import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import type { FixedPointFormData } from '@/lib/schemas/plan.schema';

type FixedPointFormProps = {
  form: UseFormReturn<FixedPointFormData>;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  getDateForPicker: () => Date | undefined;
  getTimeForInput: () => string;
  handleDateSelect: (date: Date | undefined) => void;
  handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  getDateForPicker,
  getTimeForInput,
  handleDateSelect,
  handleTimeChange,
}: FixedPointFormProps) {
  const {
    register,
    control,
    formState: { errors, isValid },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{isEditing ? 'Edytuj stały punkt' : 'Dodaj stały punkt'}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form onSubmit={onSubmit} className='space-y-4'>
          {/* Location */}
          <div className='space-y-2'>
            <Label htmlFor='location'>
              Lokalizacja <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='location'
              data-testid='fixed-point-location-input'
              placeholder='np. Lotnisko Chopina'
              {...register('location')}
              className={errors.location ? 'border-destructive' : ''}
              aria-required='true'
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'location-error' : undefined}
            />
            {errors.location && (
              <p id='location-error' className='text-sm text-destructive'>
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='event_at'>
                Data i godzina <span className='text-destructive'>*</span>
              </Label>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <Controller
                    name='event_at'
                    control={control}
                    render={() => (
                      <DatePicker
                        date={getDateForPicker()}
                        onSelect={handleDateSelect}
                        placeholder='Wybierz datę'
                        data-testid='fixed-point-date-picker'
                      />
                    )}
                  />
                </div>
                <div className='w-28'>
                  <Input id='event_time' type='time' value={getTimeForInput()} onChange={handleTimeChange} />
                </div>
              </div>
              {errors.event_at && <p className='text-sm text-destructive'>{errors.event_at.message}</p>}
            </div>

            {/* Duration */}
            <div className='space-y-2'>
              <Label htmlFor='event_duration'>Czas trwania (minuty) - opcjonalnie</Label>
              <Input
                id='event_duration'
                type='number'
                min='0'
                {...register('event_duration', {
                  setValueAs: (v) => (v === '' || v === null ? null : parseInt(v, 10)),
                })}
                placeholder='np. 120'
                className={errors.event_duration ? 'border-destructive' : ''}
              />
              {errors.event_duration && <p className='text-sm text-destructive'>{errors.event_duration.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Opis (opcjonalnie)</Label>
            <Textarea
              id='description'
              placeholder='np. Przylot, zameldowanie w hotelu'
              {...register('description')}
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className='flex gap-2'>
            <Button type='submit' disabled={!isValid} className='flex-1' data-testid='save-fixed-point-btn'>
              {isEditing ? 'Zapisz zmiany' : 'Dodaj punkt'}
            </Button>
            <Button type='button' variant='outline' onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
