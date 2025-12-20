import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type FormNumberFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  testId?: string;
};

/**
 * Generic form number field component.
 * Wraps react-hook-form FormField with number Input for consistent styling.
 */
export function FormNumberField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  testId,
}: FormNumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className='text-destructive'> *</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type='number'
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              data-testid={testId}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? null : parseInt(value, 10));
              }}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
