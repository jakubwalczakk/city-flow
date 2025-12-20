import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { DateTimePickerField } from '@/components/ui/date-time-picker-field';
import { FormTextField, FormTextareaField } from '@/components/ui/form-fields';
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
        <FormTextField
          control={form.control}
          name='name'
          label='Nazwa planu'
          placeholder='np. Weekend w Paryżu'
          required
          testId='plan-name-input'
          onBlur={syncToParent}
        />

        <FormTextField
          control={form.control}
          name='destination'
          label='Miejsce docelowe'
          placeholder='np. Paryż, Francja'
          required
          testId='plan-destination-input'
          onBlur={syncToParent}
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

        <FormTextareaField
          control={form.control}
          name='notes'
          label='Notatki'
          placeholder='Dodaj dodatkowe notatki lub preferencje dotyczące podróży...'
          description='Uwzględnij wszelkie preferencje, specjalne wymagania lub pomysły dotyczące tej podróży.'
          onBlur={syncToParent}
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
