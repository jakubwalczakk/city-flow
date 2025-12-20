import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateTimePickerField } from '@/components/ui/date-time-picker-field';
import { useBasicInfoStep } from '@/hooks/useBasicInfoStep';
import type { NewPlanViewModel } from '@/types';

type BasicInfoStepProps = {
  formData: NewPlanViewModel['basicInfo'];
  updateFormData: (data: Partial<NewPlanViewModel['basicInfo']>) => void;
  goToNextStep: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  onSave: () => Promise<void>;
};

/**
 * First step of the plan creation wizard.
 * Collects basic information: name, destination, dates, and notes.
 * Uses react-hook-form with zod validation.
 */
export function BasicInfoStep({
  formData,
  updateFormData,
  goToNextStep,
  onCancel,
  isLoading,
  error,
  onSave,
}: BasicInfoStepProps) {
  const {
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
  } = useBasicInfoStep({ formData, updateFormData, goToNextStep, onSave });

  const isFormValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form onSubmit={handleNext} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nazwa planu <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid='plan-name-input'
                  placeholder='np. Weekend w Paryżu'
                  onBlur={() => {
                    field.onBlur();
                    syncToParent();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='destination'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Miejsce docelowe <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid='plan-destination-input'
                  placeholder='np. Paryż, Francja'
                  onBlur={() => {
                    field.onBlur();
                    syncToParent();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='start_date'
            render={({ field, fieldState }) => (
              <DateTimePickerField
                label='Data i godzina rozpoczęcia'
                date={field.value}
                timeValue={dateToTime(field.value)}
                onDateSelect={(date) => handleDateSelect('start_date', date)}
                onTimeChange={(time) => handleTimeChange('start_date', time)}
                open={isStartOpen}
                onOpenChange={setIsStartOpen}
                error={fieldState.error?.message}
                required
                dateTestId='start-date-picker'
              />
            )}
          />

          <FormField
            control={form.control}
            name='end_date'
            render={({ field, fieldState }) => (
              <DateTimePickerField
                label='Data i godzina zakończenia'
                date={field.value}
                timeValue={dateToTime(field.value)}
                onDateSelect={(date) => handleDateSelect('end_date', date)}
                onTimeChange={(time) => handleTimeChange('end_date', time)}
                open={isEndOpen}
                onOpenChange={setIsEndOpen}
                minDate={form.watch('start_date')}
                error={fieldState.error?.message}
                required
                dateTestId='end-date-picker'
              />
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notatki</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder='Dodaj dodatkowe notatki lub preferencje dotyczące podróży...'
                  rows={4}
                  onBlur={() => {
                    field.onBlur();
                    syncToParent();
                  }}
                />
              </FormControl>
              <p className='text-sm text-muted-foreground'>
                Uwzględnij wszelkie preferencje, specjalne wymagania lub pomysły dotyczące tej podróży.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className='text-sm text-destructive'>{error}</p>}

        <div className='flex justify-between pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Anuluj
          </Button>
          <div className='flex gap-2'>
            <Button type='button' variant='outline' onClick={handleSave} disabled={!isFormValid || isLoading}>
              {isLoading ? 'Zapisywanie...' : 'Zapisz jako szkic'}
            </Button>
            <Button type='submit' disabled={!isFormValid || isLoading} data-testid='basic-info-next-button'>
              Dalej
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
