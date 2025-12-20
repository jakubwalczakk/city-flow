import { useMemo } from 'react';
import type { PlanDetailsDto, TimelineItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FeedbackModule from '@/components/FeedbackModule';
import { parseGeneratedContent } from '@/lib/services/planContentParser';
import { PlanSummaryCard } from '@/components/generated-plan/PlanSummaryCard';
import { WarningsCard } from '@/components/generated-plan/WarningsCard';
import { ModificationsCard } from '@/components/generated-plan/ModificationsCard';
import { DailyItinerary } from '@/components/generated-plan/DailyItinerary';

type GeneratedPlanViewProps = {
  plan: PlanDetailsDto;
  onAddActivity?: (date: string) => void;
  onEditActivity?: (date: string, item: TimelineItem) => void;
  onDeleteActivity?: (date: string, itemId: string) => void;
};

/**
 * Displays the generated plan with daily timeline and feedback module.
 * This view is shown when the plan status is 'generated'.
 * Uses memoization for expensive parsing operations.
 */
export default function GeneratedPlanView({
  plan,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: GeneratedPlanViewProps) {
  // Memoize parsing to avoid re-parsing on every render
  const generatedContent = useMemo(() => parseGeneratedContent(plan.generated_content), [plan.generated_content]);

  // If content is not available or invalid
  if (!generatedContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wygenerowany plan</CardTitle>
          <CardDescription>
            Twój plan został wygenerowany, ale format zawartości jest nieprawidłowy lub niedostępny.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Spróbuj ponownie wygenerować plan lub skontaktuj się z pomocą techniczną, jeśli problem będzie się
            powtarzał.
          </p>
          {plan.generated_content && (
            <details className='mt-4'>
              <summary className='cursor-pointer text-sm text-muted-foreground hover:text-foreground'>
                Pokaż surowe dane
              </summary>
              <pre className='mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-96'>
                {JSON.stringify(plan.generated_content, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Plan Summary */}
      <PlanSummaryCard summary={generatedContent.summary} />

      {/* AI Warnings */}
      {generatedContent.warnings && <WarningsCard warnings={generatedContent.warnings} />}

      {/* AI Modifications */}
      {generatedContent.modifications && <ModificationsCard modifications={generatedContent.modifications} />}

      {/* Daily Itinerary */}
      <DailyItinerary
        days={generatedContent.days}
        currency={generatedContent.currency}
        onAddActivity={onAddActivity}
        onEditActivity={onEditActivity}
        onDeleteActivity={onDeleteActivity}
      />

      {/* Feedback module */}
      <FeedbackModule planId={plan.id} />
    </div>
  );
}
