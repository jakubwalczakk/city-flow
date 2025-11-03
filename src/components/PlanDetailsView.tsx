import { usePlanDetails } from "@/hooks/usePlanDetails";
import PlanHeader from "@/components/PlanHeader";
import DraftPlanView from "@/components/DraftPlanView";
import GeneratedPlanView from "@/components/GeneratedPlanView";

type PlanDetailsViewProps = {
  planId: string;
};

/**
 * Main component for the plan details view.
 * Fetches plan data and renders the appropriate view based on the plan's status.
 */
export default function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const { plan, isLoading, error, updatePlanName, deletePlan } = usePlanDetails(planId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Plan</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a
            href="/plans"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ← Back to Plans
          </a>
        </div>
      </div>
    );
  }

  // Plan not found
  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Plan Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The plan you're looking for doesn't exist or has been deleted.
          </p>
          <a
            href="/plans"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ← Back to Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <a
          href="/plans"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Plans
        </a>
      </div>

      <PlanHeader plan={plan} onUpdate={updatePlanName} onDelete={deletePlan} />

      {plan.status === "draft" && <DraftPlanView plan={plan} />}
      {plan.status === "generated" && <GeneratedPlanView plan={plan} />}
      {plan.status === "archived" && (
        <div className="rounded-lg border border-muted bg-muted/20 p-6 text-center">
          <p className="text-muted-foreground">This plan has been archived.</p>
        </div>
      )}
    </div>
  );
}

