import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NewPlanViewModel } from '@/types';
import { Calendar, MapPin, FileText, Loader2 } from 'lucide-react';
import { SummaryField, FixedPointSummaryItem } from '@/components/summary';
import { formatDateObjectLong } from '@/lib/utils/dateFormatters';

type SummaryStepProps = {
  formData: NewPlanViewModel;
  goToPrevStep: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
};

/**
 * Summary step component for the plan creation wizard.
 * Displays all collected information before final submission.
 */
export const SummaryStep = memo(function SummaryStep({
  formData,
  goToPrevStep,
  onSubmit,
  isLoading,
  error,
}: SummaryStepProps) {
  const { basicInfo, fixedPoints } = formData;

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Przejrzyj swój plan</h3>
        <p className='text-sm text-muted-foreground'>Przejrzyj wszystkie informacje przed utworzeniem planu podróży.</p>
      </div>

      {/* Basic Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <SummaryField label='Nazwa planu'>{basicInfo.name}</SummaryField>

          <SummaryField icon={MapPin} label='Miejsce docelowe'>
            {basicInfo.destination}
          </SummaryField>

          <SummaryField icon={Calendar} label='Daty i godziny podróży'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground font-normal'>Początek:</span>
                <span>{formatDateObjectLong(basicInfo.start_date)}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground font-normal'>Koniec:</span>
                <span>{formatDateObjectLong(basicInfo.end_date)}</span>
              </div>
            </div>
          </SummaryField>

          {basicInfo.notes && (
            <SummaryField icon={FileText} label='Notatki'>
              <p className='text-sm font-normal'>{basicInfo.notes}</p>
            </SummaryField>
          )}
        </CardContent>
      </Card>

      {/* Fixed Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center justify-between'>
            <span>Stałe punkty</span>
            <Badge variant='secondary'>{fixedPoints.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fixedPoints.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Nie dodano stałych punktów. Możesz dodać je później.</p>
          ) : (
            <div className='space-y-3'>
              {fixedPoints.map((point, index) => (
                <FixedPointSummaryItem key={index} point={point} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error message */}
      {error && <div className='rounded-lg bg-destructive/15 p-4 text-sm text-destructive'>{error}</div>}

      {/* Navigation buttons */}
      <div className='flex justify-between pt-4'>
        <Button variant='outline' onClick={goToPrevStep} disabled={isLoading}>
          Wstecz
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} data-testid='create-plan-button'>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Tworzenie planu...
            </>
          ) : (
            'Utwórz plan'
          )}
        </Button>
      </div>
    </div>
  );
});
