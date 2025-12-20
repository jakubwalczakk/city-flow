import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type NotesSectionProps = {
  notes: string;
  onChange: (notes: string) => void;
};

/**
 * Section for editing plan notes and preferences
 */
export function NotesSection({ notes, onChange }: NotesSectionProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label htmlFor='notes' className='text-base font-medium'>
          Notatki i preferencje podróży
        </Label>
      </div>
      <Textarea
        id='notes'
        placeholder='Dodaj notatki o swoim stylu podróżowania, zainteresowaniach, budżecie, ograniczeniach dietetycznych lub czymkolwiek innym, co pomoże stworzyć idealny plan...'
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className='resize-none'
      />
      <p className='text-xs text-muted-foreground'>
        Podziel się swoimi preferencjami, aby pomóc nam stworzyć spersonalizowany plan podróży. Uwzględnij takie rzeczy
        jak: obowiązkowe atrakcje, preferencje żywieniowe, poziom aktywności, kwestie budżetowe lub inne specjalne
        wymagania.
      </p>
    </div>
  );
}
