import { usePlanDetails } from '@/hooks/usePlanDetails';
import { useActivityFormState } from '@/hooks/useActivityFormState';
import PlanHeader from '@/components/PlanHeader';
import GeneratedPlanView from '@/components/GeneratedPlanView';
import ActivityForm from '@/components/ActivityForm';
import NewPlanForm from '@/components/NewPlanForm';
import { LoadingView, ErrorView, NotFoundView, BackLink, ArchivedBanner } from '@/components/ui/state-views';
import { QueryProvider } from '@/components/providers/QueryProvider';

type PlanDetailsViewProps = {
  planId: string;
};

/**
 * Main component for the plan details view.
 * Fetches plan data and renders the appropriate view based on the plan's status.
 */
function PlanDetailsViewContent({ planId }: PlanDetailsViewProps) {
  const {
    plan,
    isLoading,
    error,
    updatePlanName,
    deletePlan,
    archivePlan,
    addActivity,
    updateActivity,
    deleteActivity,
  } = usePlanDetails(planId);

  const { formState, openAddForm, openEditForm, closeForm, handleFormSubmit, handleDelete } = useActivityFormState({
    onAddActivity: addActivity,
    onUpdateActivity: updateActivity,
    onDeleteActivity: deleteActivity,
  });

  // Loading state
  if (isLoading) {
    return <LoadingView message='Ładowanie planu...' />;
  }

  // Error state
  if (error) {
    return <ErrorView title='Nie można załadować planu' message={error} />;
  }

  // Plan not found
  if (!plan) {
    return <NotFoundView title='Plan nie został znaleziony' message='Szukany plan nie istnieje lub został usunięty.' />;
  }

  return (
    <div className='space-y-6' data-testid='plan-details-view'>
      {/* Back navigation */}
      <div className='flex items-center gap-2'>
        <BackLink />
      </div>

      <PlanHeader plan={plan} onUpdate={updatePlanName} onDelete={deletePlan} onArchive={archivePlan} />

      {plan.status === 'draft' && (
        <div className='mt-6' data-testid='plan-draft-section'>
          <NewPlanForm
            editingPlan={{
              id: plan.id,
              name: plan.name,
              destination: plan.destination,
              start_date: plan.start_date,
              end_date: plan.end_date,
              status: plan.status,
              created_at: plan.created_at,
            }}
            onFinished={() => window.location.reload()}
          />
        </div>
      )}

      {plan.status === 'generated' && (
        <>
          <div data-testid='plan-generated-section'>
            <GeneratedPlanView
              plan={plan}
              onAddActivity={openAddForm}
              onEditActivity={openEditForm}
              onDeleteActivity={handleDelete}
            />
          </div>
          <ActivityForm
            isOpen={formState.isOpen}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
            initialData={formState.item || undefined}
            mode={formState.mode}
          />
        </>
      )}

      {plan.status === 'archived' && (
        <div data-testid='plan-archived-section'>
          <ArchivedBanner />
          <GeneratedPlanView plan={plan} />
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper component that provides QueryClient context to PlanDetailsView
 */
export default function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  return (
    <QueryProvider>
      <PlanDetailsViewContent planId={planId} />
    </QueryProvider>
  );
}
