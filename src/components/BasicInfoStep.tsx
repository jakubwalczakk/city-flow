import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { basicInfoSchema } from '@/lib/schemas/plan.schema';
import type { NewPlanViewModel } from '@/types';
import { ZodError } from 'zod';

type BasicInfoStepProps = {
  formData: NewPlanViewModel['basicInfo'];
  updateFormData: (data: Partial<NewPlanViewModel['basicInfo']>) => void;
  goToNextStep: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  onSave: () => Promise<void>;
};

export function BasicInfoStep({
  formData,
  updateFormData,
  goToNextStep,
  onCancel,
  isLoading,
  error,
  onSave,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Convert Date to time string (HH:mm)
  const dateToTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateSelect = (field: 'start_date' | 'end_date', date: Date | undefined) => {
    if (!date) return;
    const current = formData[field];
    const newDate = new Date(date);
    // Preserve existing time
    newDate.setHours(current.getHours());
    newDate.setMinutes(current.getMinutes());

    updateFormData({ [field]: newDate });

    if (field === 'start_date') {
      setIsStartOpen(false);
      // Auto-open end date picker if it's not already set or just always for better flow
      setIsEndOpen(true);
    } else {
      setIsEndOpen(false);
    }
  };

  const handleTimeChange = (field: 'start_date' | 'end_date', timeStr: string) => {
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(formData[field]);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    updateFormData({ [field]: newDate });
  };

  const validateAndProceed = () => {
    try {
      basicInfoSchema.parse(formData);
      setErrors({});
      goToNextStep();
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (typeof path === 'string') {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleSave = () => {
    try {
      basicInfoSchema.parse(formData);
      setErrors({});
      onSave();
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (typeof path === 'string') {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const isFormValid = () => {
    try {
      basicInfoSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='name'>
          Nazwa planu <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='name'
          data-testid='plan-name-input'
          placeholder='np. Weekend w Paryżu'
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className='text-sm text-destructive'>{errors.name}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='destination'>
          Miejsce docelowe <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='destination'
          data-testid='plan-destination-input'
          placeholder='np. Paryż, Francja'
          value={formData.destination}
          onChange={(e) => updateFormData({ destination: e.target.value })}
          className={errors.destination ? 'border-destructive' : ''}
        />
        {errors.destination && <p className='text-sm text-destructive'>{errors.destination}</p>}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='start_date'>
            Data i godzina rozpoczęcia <span className='text-destructive'>*</span>
          </Label>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <DatePicker
                date={formData.start_date}
                onSelect={(date) => handleDateSelect('start_date', date)}
                open={isStartOpen}
                onOpenChange={setIsStartOpen}
                placeholder='Wybierz datę'
                data-testid='start-date-picker'
              />
            </div>
            <div className='w-28'>
              <Input
                id='start_time'
                type='time'
                value={dateToTime(formData.start_date)}
                onChange={(e) => handleTimeChange('start_date', e.target.value)}
              />
            </div>
          </div>
          {errors.start_date && <p className='text-sm text-destructive'>{errors.start_date}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='end_date'>
            Data i godzina zakończenia <span className='text-destructive'>*</span>
          </Label>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <DatePicker
                date={formData.end_date}
                onSelect={(date) => handleDateSelect('end_date', date)}
                open={isEndOpen}
                onOpenChange={setIsEndOpen}
                minDate={formData.start_date}
                placeholder='Wybierz datę'
                data-testid='end-date-picker'
              />
            </div>
            <div className='w-28'>
              <Input
                id='end_time'
                type='time'
                value={dateToTime(formData.end_date)}
                onChange={(e) => handleTimeChange('end_date', e.target.value)}
              />
            </div>
          </div>
          {errors.end_date && <p className='text-sm text-destructive'>{errors.end_date}</p>}
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes'>Notatki</Label>
        <Textarea
          id='notes'
          placeholder='Dodaj dodatkowe notatki lub preferencje dotyczące podróży...'
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={4}
        />
        <p className='text-sm text-muted-foreground'>
          Uwzględnij wszelkie preferencje, specjalne wymagania lub pomysły dotyczące tej podróży.
        </p>
      </div>

      {error && <p className='text-sm text-destructive'>{error}</p>}

      <div className='flex justify-between pt-4'>
        <Button variant='outline' onClick={onCancel}>
          Anuluj
        </Button>
        <div>
          <Button variant='outline' onClick={handleSave} disabled={!isFormValid() || isLoading} className='mr-2'>
            {isLoading ? 'Zapisywanie...' : 'Zapisz jako szkic'}
          </Button>
          <Button
            onClick={validateAndProceed}
            disabled={!isFormValid() || isLoading}
            data-testid='basic-info-next-button'
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}
