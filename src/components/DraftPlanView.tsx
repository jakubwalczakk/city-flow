import type { PlanDetailsDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDraftPlan } from '@/hooks/useDraftPlan';
import { NotesSection } from '@/components/draft-plan/NotesSection';
import { DatesSection } from '@/components/draft-plan/DatesSection';
import { FixedPointsSection } from '@/components/draft-plan/FixedPointsSection';
import { toast } from 'sonner';

type DraftPlanViewProps = {
  plan: PlanDetailsDto;
  onGenerate: () => Promise<void>;
  onEdit: () => void;
};

/**
 * Displays the draft plan view with an editable form.
 * This view is shown when the plan status is 'draft'.
 * Uses React Query for data fetching and mutations.
 */
export default function DraftPlanView({ plan, onGenerate, onEdit }: DraftPlanViewProps) {
  const {
    notes,
    setNotes,
    hasChanges,
    fixedPoints,
    isLoadingFixedPoints,
    handleSave,
    handleGenerate,
    isSaving,
    isGenerating,
    saveSuccess,
    saveError,
  } = useDraftPlan({ plan });

  const handleGenerateClick = async () => {
    try {
      await handleGenerate();
      await onGenerate();
    } catch (error) {
      toast.error('Błąd generowania', {
        description: error instanceof Error ? error.message : 'Nie udało się wygenerować planu',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Plan w wersji roboczej</CardTitle>
          <CardDescription>
            Ten plan jest w statusie roboczym. Dodaj swoje notatki i preferencje, a następnie wygeneruj spersonalizowany
            plan podróży.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Destination (read-only) */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-medium'>Miejsce docelowe</Label>
            </div>
            <div className='rounded-md bg-muted p-3'>
              <p className='text-sm'>{plan.destination}</p>
            </div>
            <p className='text-xs text-muted-foreground'>Miejsca docelowego nie można zmienić po utworzeniu planu.</p>
          </div>

          {/* Notes section */}
          <NotesSection notes={notes} onChange={setNotes} />

          {/* Save/Generate messages */}
          {saveSuccess && (
            <div className='rounded-md p-3 text-sm bg-green-50 text-green-800 border border-green-200'>
              Zmiany zostały zapisane!
            </div>
          )}

          {saveError && (
            <div className='rounded-md p-3 text-sm bg-red-50 text-red-800 border border-red-200'>
              Nie udało się zapisać zmian. Spróbuj ponownie.
            </div>
          )}

          {/* Action buttons */}
          <div className='flex items-center justify-between pt-4'>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} variant='outline'>
              {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>

            <Button onClick={handleGenerateClick} size='lg' disabled={isGenerating || isSaving}>
              {isGenerating ? (
                <>
                  Generowanie...
                  <div className='ml-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' />
                </>
              ) : (
                <>
                  Wygeneruj plan
                  <svg className='ml-2 h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dates section */}
      <DatesSection startDate={plan.start_date} endDate={plan.end_date} />

      {/* Fixed Points section */}
      <FixedPointsSection fixedPoints={fixedPoints} isLoading={isLoadingFixedPoints} onEdit={onEdit} />
    </div>
  );
}
