import type { PlanListItemDto } from '@/types';
import { PlanCard } from '@/components/PlanCard';
import { EmptyState } from '@/components/EmptyState';

/**
 * Props for the PlanList component.
 */
type PlanListProps = {
  plans: PlanListItemDto[];
  isLoading: boolean;
  error: string | null;
  onPlanClick: (plan: PlanListItemDto) => void;
  onPlanDelete: (planId: string) => void;
  onCreatePlan?: () => void;
};

/**
 * Component for rendering a grid of plan cards.
 * Displays loading state, error state, or empty state as needed.
 */
export const PlanList = ({ plans, isLoading, error, onPlanClick, onPlanDelete, onCreatePlan }: PlanListProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className='h-48 animate-pulse rounded-lg border bg-muted' aria-label='Loading plan card' />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='rounded-lg border border-destructive bg-destructive/10 p-6 text-center'>
        <p className='text-sm text-destructive'>Wystąpił błąd podczas pobierania planów. Spróbuj odświeżyć stronę.</p>
        <p className='mt-2 text-xs text-muted-foreground'>{error}</p>
      </div>
    );
  }

  // Empty state
  if (plans.length === 0) {
    return <EmptyState onCreatePlan={onCreatePlan} />;
  }

  // Plans grid
  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onClick={() => onPlanClick(plan)} onDelete={onPlanDelete} />
      ))}
    </div>
  );
};
