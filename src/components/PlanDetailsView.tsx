import { useState } from 'react';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import PlanHeader from '@/components/PlanHeader';
import DraftPlanView from '@/components/DraftPlanView';
import GeneratedPlanView from '@/components/GeneratedPlanView';
import ActivityForm from '@/components/ActivityForm';
import type { TimelineItem } from '@/types';

type PlanDetailsViewProps = {
  planId: string;
};

type ActivityFormState = {
  isOpen: boolean;
  mode: 'add' | 'edit';
  date: string | null;
  item: TimelineItem | null;
};

/**
 * Main component for the plan details view.
 * Fetches plan data and renders the appropriate view based on the plan's status.
 */
export default function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const { plan, isLoading, error, updatePlanName, deletePlan, addActivity, updateActivity, deleteActivity } =
    usePlanDetails(planId);

  const [activityFormState, setActivityFormState] = useState<ActivityFormState>({
    isOpen: false,
    mode: 'add',
    date: null,
    item: null,
  });

  const handleAddActivity = (date: string) => {
    setActivityFormState({
      isOpen: true,
      mode: 'add',
      date,
      item: null,
    });
  };

  const handleEditActivity = (date: string, item: TimelineItem) => {
    setActivityFormState({
      isOpen: true,
      mode: 'edit',
      date,
      item,
    });
  };

  const handleDeleteActivity = async (date: string, itemId: string) => {
    try {
      await deleteActivity(date, itemId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete activity');
    }
  };

  const handleActivityFormSubmit = async (activity: Partial<TimelineItem>) => {
    try {
      if (activityFormState.mode === 'add' && activityFormState.date) {
        await addActivity(activityFormState.date, activity);
      } else if (activityFormState.mode === 'edit' && activityFormState.date && activityFormState.item) {
        await updateActivity(activityFormState.date, activityFormState.item.id, activity);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save activity');
      throw error; // Re-throw to prevent form from closing
    }
  };

  const handleActivityFormClose = () => {
    setActivityFormState({
      isOpen: false,
      mode: 'add',
      date: null,
      item: null,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]' />
          <p className='mt-4 text-muted-foreground'>Ładowanie planu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center max-w-md'>
          <div className='mb-4'>
            <svg
              className='mx-auto h-12 w-12 text-destructive'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold mb-2'>Nie można załadować planu</h2>
          <p className='text-muted-foreground mb-6'>{error}</p>
          <a
            href='/plans'
            className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            ← Powrót do planów
          </a>
        </div>
      </div>
    );
  }

  // Plan not found
  if (!plan) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center max-w-md'>
          <h2 className='text-xl font-semibold mb-2'>Plan nie został znaleziony</h2>
          <p className='text-muted-foreground mb-6'>Szukany plan nie istnieje lub został usunięty.</p>
          <a
            href='/plans'
            className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            ← Powrót do planów
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Back navigation */}
      <div className='flex items-center gap-2'>
        <a
          href='/plans'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
          Powrót do planów
        </a>
      </div>

      <PlanHeader plan={plan} onUpdate={updatePlanName} onDelete={deletePlan} />

      {plan.status === 'draft' && <DraftPlanView plan={plan} />}
      {plan.status === 'generated' && (
        <>
          <GeneratedPlanView
            plan={plan}
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
          />
          <ActivityForm
            isOpen={activityFormState.isOpen}
            onClose={handleActivityFormClose}
            onSubmit={handleActivityFormSubmit}
            initialData={activityFormState.item || undefined}
            mode={activityFormState.mode}
          />
        </>
      )}
      {plan.status === 'archived' && (
        <div className='rounded-lg border border-muted bg-muted/20 p-6 text-center'>
          <p className='text-muted-foreground'>Ten plan został zarchiwizowany.</p>
        </div>
      )}
    </div>
  );
}
