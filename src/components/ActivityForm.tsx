import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TimelineItem, TimelineItemCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { activitySchema, transformActivityFormData, type ActivityFormData } from '@/lib/schemas/activity.schema';
import { convertTo24Hour } from '@/lib/utils/timeFormatters';

type ActivityFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Partial<TimelineItem>) => Promise<void>;
  initialData?: Partial<TimelineItem>;
  mode: 'add' | 'edit';
};

const CATEGORIES: { value: TimelineItemCategory; label: string }[] = [
  { value: 'history', label: 'Historia' },
  { value: 'food', label: 'Jedzenie' },
  { value: 'sport', label: 'Sport' },
  { value: 'nature', label: 'Natura' },
  { value: 'culture', label: 'Kultura' },
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Zakwaterowanie' },
  { value: 'other', label: 'Inne' },
];

/**
 * A form component for adding or editing activities in a plan.
 * Displays in a modal dialog and handles validation with React Hook Form.
 */
export default function ActivityForm({ isOpen, onClose, onSubmit, initialData, mode }: ActivityFormProps) {
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      time: '',
      category: 'other',
      location: '',
      description: '',
      estimated_price: '',
      estimated_duration: '',
    },
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (isOpen && initialData) {
      // Ensure time is in 24-hour format for the input
      let timeValue = initialData.time || '';
      if (timeValue && /AM|PM/i.test(timeValue)) {
        timeValue = convertTo24Hour(timeValue);
      }

      // Parse duration from "60 min" to "60"
      const durationValue = initialData.estimated_duration?.replace(/\D/g, '') || '';

      form.reset({
        title: initialData.title || '',
        time: timeValue,
        category: (initialData.category as TimelineItemCategory) || 'other',
        location: initialData.location || '',
        description: initialData.description || '',
        estimated_price: initialData.estimated_price || '',
        estimated_duration: durationValue,
      });
    } else if (isOpen) {
      // Reset to default values when adding new activity
      form.reset({
        title: '',
        time: '',
        category: 'other',
        location: '',
        description: '',
        estimated_price: '',
        estimated_duration: '',
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const transformedData = transformActivityFormData(data);
      await onSubmit(transformedData);
      onClose();
    } catch {
      // Error handling is done by the parent component
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Dodaj aktywność' : 'Edytuj aktywność'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Dodaj własną aktywność do swojego planu.' : 'Zaktualizuj szczegóły tej aktywności.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tytuł <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='np. Wizyta w lokalnej kawiarni' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Godzina</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kategoria <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Wybierz kategorię' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokalizacja</FormLabel>
                  <FormControl>
                    <Input placeholder='np. Dzielnica Trastevere' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Dodaj szczegóły dotyczące tej aktywności...' rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='estimated_duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Czas trwania (minuty)</FormLabel>
                    <FormControl>
                      <Input type='number' min='1' placeholder='np. 60' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='estimated_price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Szacowany koszt</FormLabel>
                    <FormControl>
                      <Input placeholder='np. 20-40 PLN' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose} disabled={form.formState.isSubmitting}>
                Anuluj
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Zapisywanie...' : mode === 'add' ? 'Dodaj aktywność' : 'Zapisz zmiany'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
