import { Progress } from '@/components/ui/progress';
import { getNextMonthResetDate } from '@/lib/utils/dateFormatters';

type GenerationsCounterProps = {
  generationsRemaining: number;
};

const MAX_GENERATIONS = 5;

/**
 * Displays the number of remaining free plan generations for the current month.
 * Shows a progress bar and information about when the limit resets.
 */
export function GenerationsCounter({ generationsRemaining }: GenerationsCounterProps) {
  const progressValue = (generationsRemaining / MAX_GENERATIONS) * 100;
  const resetDate = getNextMonthResetDate();

  return (
    <div className='space-y-4' data-testid='generations-counter'>
      <div>
        <h3 className='text-lg font-semibold'>Limit generacji</h3>
        <p className='text-sm text-muted-foreground mt-1'>
          Pozostało planów: {generationsRemaining}/{MAX_GENERATIONS}
        </p>
      </div>

      <Progress value={progressValue} className='h-2' />

      <p className='text-xs text-muted-foreground'>Limit odnowi się {resetDate}</p>
    </div>
  );
}
