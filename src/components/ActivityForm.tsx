import type { TimelineItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormTextField, FormTextareaField, FormSelectField } from '@/components/ui/form-fields';
import { useActivityForm } from '@/hooks/useActivityForm';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/categories';

type ActivityFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Partial<TimelineItem>) => Promise<void>;
  initialData?: Partial<TimelineItem>;
  mode: 'add' | 'edit';
};

/**
 * A form component for adding or editing activities in a plan.
 * Displays in a modal dialog and handles validation with React Hook Form.
 */
export default function ActivityForm({ isOpen, onClose, onSubmit, initialData, mode }: ActivityFormProps) {
  const { form, submitHandler, isSubmitting } = useActivityForm({
    isOpen,
    initialData,
    onSubmit,
    onClose,
  });

  const dialogTitle = mode === 'add' ? 'Dodaj aktywność' : 'Edytuj aktywność';
  const dialogDescription =
    mode === 'add' ? 'Dodaj własną aktywność do swojego planu.' : 'Zaktualizuj szczegóły tej aktywności.';
  const submitLabel = mode === 'add' ? 'Dodaj aktywność' : 'Zapisz zmiany';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={submitHandler} className='space-y-4'>
            <FormTextField
              control={form.control}
              name='title'
              label='Tytuł'
              placeholder='np. Wizyta w lokalnej kawiarni'
              required
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormTextField control={form.control} name='time' label='Godzina' type='time' />

              <FormSelectField
                control={form.control}
                name='category'
                label='Kategoria'
                options={ACTIVITY_CATEGORIES}
                placeholder='Wybierz kategorię'
                required
              />
            </div>

            <FormTextField
              control={form.control}
              name='location'
              label='Lokalizacja'
              placeholder='np. Dzielnica Trastevere'
            />

            <FormTextareaField
              control={form.control}
              name='description'
              label='Opis'
              placeholder='Dodaj szczegóły dotyczące tej aktywności...'
              rows={3}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormTextField
                control={form.control}
                name='estimated_duration'
                label='Czas trwania (minuty)'
                type='number'
                min='1'
                placeholder='np. 60'
              />

              <FormTextField
                control={form.control}
                name='estimated_price'
                label='Szacowany koszt'
                placeholder='np. 20-40 PLN'
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
                Anuluj
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Zapisywanie...' : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
