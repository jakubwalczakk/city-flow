import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NewPlanViewModel } from '@/types';
import { Calendar, MapPin, FileText, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

type SummaryStepProps = {
  formData: NewPlanViewModel;
  goToPrevStep: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
};

export function SummaryStep({ formData, goToPrevStep, onSubmit, isLoading, error }: SummaryStepProps) {
  const { basicInfo, fixedPoints } = formData;

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: false,
      });
    } catch {
      return dateTimeString;
    }
  };

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
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Nazwa planu</p>
            <p className='font-medium'>{basicInfo.name}</p>
          </div>

          <div>
            <p className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
              <MapPin className='h-3 w-3' />
              Miejsce docelowe
            </p>
            <p className='font-medium'>{basicInfo.destination}</p>
          </div>

          <div>
            <p className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              Daty i godziny podróży
            </p>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Początek:</span>
                <span className='font-medium'>
                  {format(basicInfo.start_date, 'PPP', { locale: pl })} o {format(basicInfo.start_date, 'HH:mm')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Koniec:</span>
                <span className='font-medium'>
                  {format(basicInfo.end_date, 'PPP', { locale: pl })} o {format(basicInfo.end_date, 'HH:mm')}
                </span>
              </div>
            </div>
          </div>

          {basicInfo.notes && (
            <div>
              <p className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                <FileText className='h-3 w-3' />
                Notatki
              </p>
              <p className='text-sm'>{basicInfo.notes}</p>
            </div>
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
                <div key={index} className='flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0'>
                  <MapPin className='h-4 w-4 mt-1 text-muted-foreground flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium'>{point.location}</p>
                    {point.description && <p className='text-sm text-muted-foreground'>{point.description}</p>}
                    <div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      <span>{formatDateTime(point.event_at)}</span>
                      <span>•</span>
                      <span>{point.event_duration} min</span>
                    </div>
                  </div>
                </div>
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
        <Button onClick={onSubmit} disabled={isLoading}>
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
}
