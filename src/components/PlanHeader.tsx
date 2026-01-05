import type { PlanDetailsDto } from '@/types';
import { EditableTitle } from '@/components/plan-header/EditableTitle';
import { PlanMetadata } from '@/components/plan-header/PlanMetadata';
import { PlanActionsMenu } from '@/components/plan-header/PlanActionsMenu';
import ExportPlanButton from '@/components/plan-actions/ExportPlanButton';

type PlanHeaderProps = {
  plan: PlanDetailsDto;
  onUpdate: (newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onArchive: () => Promise<void>;
};

/**
 * Header component for the plan details view.
 * Displays the plan name (editable), dates, and action menu.
 */
export default function PlanHeader({ plan, onUpdate, onDelete, onArchive }: PlanHeaderProps) {
  return (
    <div className='flex items-start justify-between gap-4 pb-6 border-b' data-testid='plan-header'>
      <div className='flex-1 min-w-0'>
        <EditableTitle title={plan.name} onSave={onUpdate} />
        <PlanMetadata startDate={plan.start_date} endDate={plan.end_date} destination={plan.destination} />
      </div>

      <div className='flex items-center gap-2'>
        {/* Export button - only show for generated plans */}
        {plan.status === 'generated' && <ExportPlanButton planId={plan.id} planName={plan.name} />}

        <PlanActionsMenu planName={plan.name} planStatus={plan.status} onArchive={onArchive} onDelete={onDelete} />
      </div>
    </div>
  );
}
