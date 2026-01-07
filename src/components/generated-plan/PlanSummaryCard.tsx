import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

type PlanSummaryCardProps = {
  summary: string;
};

/**
 * Displays the AI-generated plan summary
 */
export function PlanSummaryCard({ summary }: PlanSummaryCardProps) {
  return (
    <Card data-testid='plan-summary-card'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle data-testid='plan-summary-title'>Podsumowanie planu</CardTitle>
          <div
            className='flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
            data-testid='plan-summary-ai-badge'
          >
            <Sparkles className='h-3.5 w-3.5' />
            <span data-testid='plan-summary-ai-label'>Wygenerowano przez AI</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground' data-testid='plan-summary-text'>
          {summary}
        </p>
        <p className='mt-4 text-xs text-muted-foreground italic border-t pt-2' data-testid='plan-summary-disclaimer'>
          * Ten plan został wygenerowany przez sztuczną inteligencję. Zawsze sprawdzaj godziny otwarcia i dostępność
          atrakcji przed podróżą.
        </p>
      </CardContent>
    </Card>
  );
}
