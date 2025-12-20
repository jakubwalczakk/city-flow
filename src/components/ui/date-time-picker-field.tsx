import { useId } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DateTimePickerFieldProps = {
  label: string;
  date: Date;
  timeValue: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minDate?: Date;
  error?: string;
  required?: boolean;
  dateTestId?: string;
};

/**
 * Combined date and time picker field component.
 * Renders a DatePicker alongside a time input.
 */
export function DateTimePickerField({
  label,
  date,
  timeValue,
  onDateSelect,
  onTimeChange,
  open,
  onOpenChange,
  minDate,
  error,
  required = false,
  dateTestId,
}: DateTimePickerFieldProps) {
  const id = useId();
  const timeInputId = `${id}-time`;

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>
        {label} {required && <span className='text-destructive'>*</span>}
      </Label>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <DatePicker
            date={date}
            onSelect={onDateSelect}
            open={open}
            onOpenChange={onOpenChange}
            minDate={minDate}
            placeholder='Wybierz datę'
            data-testid={dateTestId}
          />
        </div>
        <div className='w-28'>
          <Input
            id={timeInputId}
            type='time'
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label={`${label} - godzina`}
          />
        </div>
      </div>
      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}
