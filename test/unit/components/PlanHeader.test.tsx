import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlanHeader from '@/components/PlanHeader';
import { createMockPlanDetails } from '../../utils/mock-factories';

vi.mock('@/components/plan-header/EditableTitle', () => ({
  EditableTitle: () => <div data-testid='editable-title'>Title</div>,
}));
vi.mock('@/components/plan-header/PlanMetadata', () => ({
  PlanMetadata: () => <div data-testid='plan-metadata'>Metadata</div>,
}));
vi.mock('@/components/plan-header/PlanActionsMenu', () => ({
  PlanActionsMenu: () => <div data-testid='plan-actions'>Actions</div>,
}));
vi.mock('@/components/plan-actions/ExportPlanButton', () => ({
  default: () => <div data-testid='export-btn'>Export</div>,
}));

describe('PlanHeader', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnArchive = vi.fn();

  it('should render header components', () => {
    const plan = createMockPlanDetails();
    render(<PlanHeader plan={plan} onUpdate={mockOnUpdate} onDelete={mockOnDelete} onArchive={mockOnArchive} />);
    expect(screen.getByTestId('plan-header')).toBeInTheDocument();
    expect(screen.getByTestId('editable-title')).toBeInTheDocument();
    expect(screen.getByTestId('plan-metadata')).toBeInTheDocument();
    expect(screen.getByTestId('plan-actions')).toBeInTheDocument();
  });

  it('should show export button for generated plans', () => {
    const plan = createMockPlanDetails({ status: 'generated' });
    render(<PlanHeader plan={plan} onUpdate={mockOnUpdate} onDelete={mockOnDelete} onArchive={mockOnArchive} />);
    expect(screen.getByTestId('export-btn')).toBeInTheDocument();
  });

  it('should not show export button for draft plans', () => {
    const plan = createMockPlanDetails({ status: 'draft' });
    render(<PlanHeader plan={plan} onUpdate={mockOnUpdate} onDelete={mockOnDelete} onArchive={mockOnArchive} />);
    expect(screen.queryByTestId('export-btn')).not.toBeInTheDocument();
  });
});
