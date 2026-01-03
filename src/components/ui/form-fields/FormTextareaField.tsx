import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

type FormTextareaFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  description?: string;
  testId?: string;
  onBlur?: () => void;
};

/**
 * Generic form textarea field component.
 * Wraps react-hook-form FormField with Textarea for consistent styling.
 */
export function FormTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  description,
  testId,
  onBlur,
}: FormTextareaFieldProps<T>) {
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
            <Textarea
              {...field}
              value={field.value || ''}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              data-testid={testId}
              onBlur={() => {
                field.onBlur();
                onBlur?.();
              }}
            />
          </FormControl>
          {description && <p className='text-sm text-muted-foreground'>{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
