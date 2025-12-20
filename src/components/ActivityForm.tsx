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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
          <form onSubmit={submitHandler} className='space-y-4'>
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
                        {ACTIVITY_CATEGORIES.map((cat) => (
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
              <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
                Anuluj
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Zapisywanie...' : mode === 'add' ? 'Dodaj aktywność' : 'Zapisz zmiany'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
