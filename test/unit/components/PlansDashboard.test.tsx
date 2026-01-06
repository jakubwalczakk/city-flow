import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansDashboard } from '@/components/PlansDashboard';
import * as usePlansDashboardModule from '@/hooks/usePlansDashboard';
import { createMockPlan } from '../../utils/mock-factories';

vi.mock('@/hooks/usePlansDashboard');
vi.mock('@/components/PlanList', () => ({ PlanList: () => <div data-testid='plan-list'>Plans</div> }));
vi.mock('@/components/PaginationControls', () => ({
  PaginationControls: () => <div data-testid='pagination-controls'>Pagination</div>,
}));
vi.mock('./NewPlanForm', () => ({
  default: () => (
    <>
      <div>NewPlanForm</div>
    </>
  ),
}));

describe('PlansDashboard', () => {
  const mockHandleTabChange = vi.fn();
  const mockHandlePageChange = vi.fn();
  const mockHandleModalClose = vi.fn();
  const mockHandleCreatePlan = vi.fn();
  const mockHandlePlanClick = vi.fn();
  const mockHandlePlanDelete = vi.fn();
  const mockSetIsModalOpen = vi.fn();
  const mockSetEditingPlan = vi.fn();

  const defaultHookReturn = {
    activeTab: 'my-plans',
    isModalOpen: false,
    editingPlan: null,
    plans: [createMockPlan()],
    pagination: { currentPage: 1, totalPages: 1, pageSize: 12, totalItems: 1 },
    isLoading: false,
    error: null,
    showPagination: false,
    handleTabChange: mockHandleTabChange,
    handlePageChange: mockHandlePageChange,
    handleModalClose: mockHandleModalClose,
    handleCreatePlan: mockHandleCreatePlan,
    handlePlanClick: mockHandlePlanClick,
    handlePlanDelete: mockHandlePlanDelete,
    setIsModalOpen: mockSetIsModalOpen,
    setEditingPlan: mockSetEditingPlan,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlansDashboardModule.usePlansDashboard).mockReturnValue(defaultHookReturn);
  });

  describe('rendering', () => {
    it('should render page title', () => {
      render(<PlansDashboard />);
      expect(screen.getByTestId('plans-dashboard-title')).toHaveTextContent('Moje Plany');
    });

    it('should render create plan button', () => {
      render(<PlansDashboard />);
      expect(screen.getByTestId('create-new-plan-btn')).toBeInTheDocument();
    });

    it('should render tabs', () => {
      render(<PlansDashboard />);
      expect(screen.getByTestId('plans-tabs-list')).toBeInTheDocument();
      expect(screen.getByTestId('my-plans-tab')).toBeInTheDocument();
      expect(screen.getByTestId('history-tab')).toBeInTheDocument();
    });

    it('should render PlanList component', () => {
      render(<PlansDashboard />);
      expect(screen.getByTestId('plan-list')).toBeInTheDocument();
    });
  });

  describe('tab switching', () => {
    it('should show my-plans tab content by default', () => {
      render(<PlansDashboard />);
      expect(screen.getByTestId('my-plans-tab-content')).toBeInTheDocument();
    });

    it('should call handleTabChange when switching tabs', async () => {
      const user = userEvent.setup();
      render(<PlansDashboard />);

      await user.click(screen.getByTestId('history-tab'));
      expect(mockHandleTabChange).toHaveBeenCalledWith('history');
    });
  });

  describe('modal interactions', () => {
    it('should open modal when create button is clicked', async () => {
      const user = userEvent.setup();
      render(<PlansDashboard />);

      await user.click(screen.getByTestId('create-new-plan-btn'));
      expect(mockSetIsModalOpen).toHaveBeenCalledWith(true);
      expect(mockSetEditingPlan).toHaveBeenCalledWith(null);
    });

    it('should show modal when isModalOpen is true', () => {
      vi.mocked(usePlansDashboardModule.usePlansDashboard).mockReturnValue({
        ...defaultHookReturn,
        isModalOpen: true,
      });
      render(<PlansDashboard />);
      expect(screen.getByTestId('new-plan-modal')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('should show pagination when showPagination is true', () => {
      vi.mocked(usePlansDashboardModule.usePlansDashboard).mockReturnValue({
        ...defaultHookReturn,
        showPagination: true,
      });
      render(<PlansDashboard />);
      expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
    });

    it('should not show pagination when showPagination is false', () => {
      render(<PlansDashboard />);
      expect(screen.queryByTestId('pagination-controls')).not.toBeInTheDocument();
    });
  });
});
