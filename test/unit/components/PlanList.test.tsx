import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanList } from '@/components/PlanList';
import { createMockPlan } from '../../utils/mock-factories';
import type { Plan } from '@/types';

vi.mock('@/components/PlanCard', () => ({ PlanCard: ({ plan }: { plan: Plan }) => <div>Card-{plan.id}</div> }));
vi.mock('@/components/EmptyState', () => ({ EmptyState: () => <div data-testid='empty-state'>Empty</div> }));

describe('PlanList', () => {
  const mockOnPlanClick = vi.fn();
  const mockOnPlanDelete = vi.fn();

  it('should render loading state', () => {
    render(
      <PlanList
        plans={[]}
        isLoading={true}
        error={null}
        onPlanClick={mockOnPlanClick}
        onPlanDelete={mockOnPlanDelete}
      />
    );
    expect(screen.getByTestId('plans-list-loading')).toBeInTheDocument();
  });

  it('should render error state', () => {
    render(
      <PlanList
        plans={[]}
        isLoading={false}
        error='Error'
        onPlanClick={mockOnPlanClick}
        onPlanDelete={mockOnPlanDelete}
      />
    );
    expect(screen.getByTestId('plans-list-error')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(
      <PlanList
        plans={[]}
        isLoading={false}
        error={null}
        onPlanClick={mockOnPlanClick}
        onPlanDelete={mockOnPlanDelete}
      />
    );
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('should render plans grid', () => {
    const plans = [createMockPlan({ id: '1' }), createMockPlan({ id: '2' })];
    render(
      <PlanList
        plans={plans}
        isLoading={false}
        error={null}
        onPlanClick={mockOnPlanClick}
        onPlanDelete={mockOnPlanDelete}
      />
    );
    expect(screen.getByTestId('plans-list-container')).toBeInTheDocument();
    expect(screen.getByTestId('plan-card-1')).toBeInTheDocument();
  });
});
