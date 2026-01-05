import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanCard } from '@/components/PlanCard';
import * as usePlanCardModule from '@/hooks/usePlanCard';
import type { PlanListItemDto } from '@/types';

// Mock usePlanCard hook
vi.mock('@/hooks/usePlanCard');

describe('PlanCard', () => {
  const mockPlan: PlanListItemDto = {
    id: 'plan-1',
    name: 'Paris Trip',
    destination: 'Paris',
    status: 'draft' as const,
    created_at: '2024-01-15',
    start_date: '2024-02-01',
    end_date: '2024-02-07',
  };

  const mockStatusConfig = {
    variant: 'default' as const,
    label: 'Szkic',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlanCardModule.usePlanCard).mockReturnValue({
      statusConfig: mockStatusConfig,
      formatCardDateTime: () => '15 sty 2024',
      handleDelete: vi.fn(),
      handleKeyDown: vi.fn(),
    } as ReturnType<typeof usePlanCardModule.usePlanCard>);
  });

  describe('rendering', () => {
    it('should render plan name', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('plan-name')).toBeInTheDocument();
    });

    it('should render destination', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('plan-destination')).toBeInTheDocument();
    });

    it('should render status badge', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('plan-status')).toBeInTheDocument();
    });

    it('should have proper aria label', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const card = container.querySelector('[aria-label="View plan: Paris Trip"]');
      expect(card).toBeInTheDocument();
    });

    it('should have data-testid attributes', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(container.querySelector('[data-testid="plan-card"]')).toBeInTheDocument();
      expect(container.querySelector('[data-plan-id="plan-1"]')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const card = container.querySelector('[role="link"]');
      if (card) {
        await user.click(card);
      }

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should render delete button', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('delete-plan-action')).toBeInTheDocument();
    });

    it('should not propagate click from delete button', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTestId('delete-plan-action');
      await user.click(deleteButton);

      // onClick should not be called when delete button is clicked
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('keyboard support', () => {
    it('should handle keyboard interaction', async () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();
      const mockHandleKeyDown = vi.fn();

      vi.mocked(usePlanCardModule.usePlanCard).mockReturnValue({
        statusConfig: mockStatusConfig,
        formatCardDateTime: () => '15 sty 2024',
        handleDelete: vi.fn(),
        handleKeyDown: mockHandleKeyDown,
      } as ReturnType<typeof usePlanCardModule.usePlanCard>);

      const { container } = render(<PlanCard plan={mockPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const card = container.querySelector('[role="link"]');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('different statuses', () => {
    it('should handle generated status', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      const generatedPlan = { ...mockPlan, status: 'generated' as const };

      render(<PlanCard plan={generatedPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('plan-name')).toBeInTheDocument();
    });

    it('should handle archived status', () => {
      const mockOnClick = vi.fn();
      const mockOnDelete = vi.fn();

      const archivedPlan = { ...mockPlan, status: 'archived' as const };

      render(<PlanCard plan={archivedPlan} onClick={mockOnClick} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('plan-name')).toBeInTheDocument();
    });
  });
});
