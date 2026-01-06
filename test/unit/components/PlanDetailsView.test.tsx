import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlanDetailsView from '@/components/PlanDetailsView';
import * as usePlanDetailsModule from '@/hooks/usePlanDetails';
import * as useActivityFormStateModule from '@/hooks/useActivityFormState';
import type { PlanDetailsDto } from '@/types';

// Mock hooks
vi.mock('@/hooks/usePlanDetails');
vi.mock('@/hooks/useActivityFormState');

// Mock child components
vi.mock('@/components/PlanHeader', () => ({
  default: () => <div data-testid='plan-header'>PlanHeader</div>,
}));
vi.mock('@/components/GeneratedPlanView', () => ({
  default: () => <div data-testid='generated-plan-view'>GeneratedPlanView</div>,
}));
vi.mock('@/components/ActivityForm', () => ({
  default: () => <div data-testid='activity-form'>ActivityForm</div>,
}));
vi.mock('@/components/NewPlanForm', () => ({
  default: () => <div data-testid='new-plan-form'>NewPlanForm</div>,
}));
vi.mock('@/components/ui/state-views', () => ({
  LoadingView: () => <div data-testid='loading-view'>Loading...</div>,
  ErrorView: ({ title, message }: { title: string; message: string }) => (
    <div data-testid='error-view'>
      <div data-testid='error-title'>{title}</div>
      <div data-testid='error-message'>{message}</div>
    </div>
  ),
  NotFoundView: ({ title, message }: { title: string; message: string }) => (
    <div data-testid='not-found-view'>
      <div data-testid='not-found-title'>{title}</div>
      <div data-testid='not-found-message'>{message}</div>
    </div>
  ),
  BackLink: () => <div data-testid='back-link'>Back</div>,
  ArchivedBanner: () => <div data-testid='archived-banner'>Archived</div>,
}));
vi.mock('@/components/providers/QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('PlanDetailsView', () => {
  const mockPlan: PlanDetailsDto = {
    id: 'plan-1',
    user_id: 'user-1',
    name: 'Paris Trip',
    destination: 'Paris',
    status: 'draft',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    start_date: '2024-02-01',
    end_date: '2024-02-07',
    notes: 'Test notes',
    generated_content: null,
  };

  const mockUsePlanDetails = {
    plan: mockPlan,
    isLoading: false,
    error: null,
    updatePlanName: vi.fn(),
    deletePlan: vi.fn(),
    archivePlan: vi.fn(),
    addActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
    generatePlan: vi.fn(),
    refetch: vi.fn(),
  };

  const mockUseActivityFormState = {
    formState: { isOpen: false, mode: 'add' as const, date: '', item: null },
    openAddForm: vi.fn(),
    openEditForm: vi.fn(),
    closeForm: vi.fn(),
    handleFormSubmit: vi.fn(),
    handleDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlanDetailsModule.usePlanDetails).mockReturnValue(mockUsePlanDetails);
    vi.mocked(useActivityFormStateModule.useActivityFormState).mockReturnValue(mockUseActivityFormState);
  });

  describe('rendering - loading state', () => {
    it('should show loading view when isLoading is true', () => {
      vi.mocked(usePlanDetailsModule.usePlanDetails).mockReturnValue({
        ...mockUsePlanDetails,
        isLoading: true,
        plan: null,
      });

      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.getByTestId('loading-view')).toBeInTheDocument();
    });
  });

  describe('rendering - error state', () => {
    it('should show error view when error exists', () => {
      vi.mocked(usePlanDetailsModule.usePlanDetails).mockReturnValue({
        ...mockUsePlanDetails,
        error: 'Failed to load plan',
        plan: null,
      });

      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.getByTestId('error-view')).toBeInTheDocument();
      expect(screen.getByTestId('error-title')).toHaveTextContent('Nie można załadować planu');
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load plan');
    });
  });

  describe('rendering - not found state', () => {
    it('should show not found view when plan is null', () => {
      vi.mocked(usePlanDetailsModule.usePlanDetails).mockReturnValue({
        ...mockUsePlanDetails,
        plan: null,
      });

      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.getByTestId('not-found-view')).toBeInTheDocument();
      expect(screen.getByTestId('not-found-title')).toHaveTextContent('Plan nie został znaleziony');
    });
  });

  describe('rendering - draft plan', () => {
    it('should render plan details view with draft section', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.getByTestId('plan-details-view')).toBeInTheDocument();
      expect(screen.getByTestId('back-link')).toBeInTheDocument();
      expect(screen.getByTestId('plan-header')).toBeInTheDocument();
      expect(screen.getByTestId('plan-draft-section')).toBeInTheDocument();
      expect(screen.getByTestId('new-plan-form')).toBeInTheDocument();
    });

    it('should not show generated or archived sections for draft plan', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.queryByTestId('plan-generated-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('plan-archived-section')).not.toBeInTheDocument();
    });
  });

  describe('rendering - generated plan', () => {
    beforeEach(() => {
      vi.mocked(usePlanDetailsModule.usePlanDetails).mockReturnValue({
        ...mockUsePlanDetails,
        plan: { ...mockPlan, status: 'generated', generated_content: { days: [] } },
      });
    });

    it('should render plan details view with generated section', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.getByTestId('plan-details-view')).toBeInTheDocument();
      expect(screen.getByTestId('plan-generated-section')).toBeInTheDocument();
      expect(screen.getByTestId('generated-plan-view')).toBeInTheDocument();
      expect(screen.getByTestId('activity-form')).toBeInTheDocument();
    });

    it('should not show draft or archived sections for generated plan', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.queryByTestId('plan-draft-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('plan-archived-section')).not.toBeInTheDocument();
    });
  });

  describe('rendering - archived plan', () => {
    beforeEach(() => {
      vi.mocked(usePlanDetailsModule.usePlanDetails).mockReturnValue({
        ...mockUsePlanDetails,
        plan: { ...mockPlan, status: 'archived', generated_content: { days: [] } },
      });
    });

    it('should render plan details view with archived section', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.getByTestId('plan-details-view')).toBeInTheDocument();
      expect(screen.getByTestId('plan-archived-section')).toBeInTheDocument();
      expect(screen.getByTestId('archived-banner')).toBeInTheDocument();
      expect(screen.getByTestId('generated-plan-view')).toBeInTheDocument();
    });

    it('should not show draft or generated edit sections for archived plan', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(screen.queryByTestId('plan-draft-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('plan-generated-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('activity-form')).not.toBeInTheDocument();
    });
  });

  describe('props passing', () => {
    it('should pass plan id to usePlanDetails hook', () => {
      const planId = 'test-plan-id';
      render(<PlanDetailsView planId={planId} />);

      expect(usePlanDetailsModule.usePlanDetails).toHaveBeenCalledWith(planId);
    });

    it('should pass activity callbacks to useActivityFormState hook', () => {
      render(<PlanDetailsView planId='plan-1' />);

      expect(useActivityFormStateModule.useActivityFormState).toHaveBeenCalledWith({
        onAddActivity: mockUsePlanDetails.addActivity,
        onUpdateActivity: mockUsePlanDetails.updateActivity,
        onDeleteActivity: mockUsePlanDetails.deleteActivity,
      });
    });
  });
});
