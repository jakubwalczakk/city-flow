import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventTimeline from '@/components/EventTimeline';
import * as useDeleteConfirmationModule from '@/hooks/useDeleteConfirmation';
import type { TimelineItem } from '@/types';

// Mock hooks
vi.mock('@/hooks/useDeleteConfirmation');

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock child components
vi.mock('@/components/timeline/TimelineItem', () => ({
  TimelineItem: ({ item, currency, onEdit, onDelete }: any) => (
    <div data-testid='timeline-item'>
      <span>{item.title}</span>
      <span>{currency}</span>
      {onEdit && <button onClick={() => onEdit(item)}>Edit</button>}
      {onDelete && <button onClick={() => onDelete(item.id)}>Delete</button>}
    </div>
  ),
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => (open ? <div data-testid='alert-dialog'>{children}</div> : null),
  AlertDialogAction: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h3>{children}</h3>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('EventTimeline', () => {
  const mockItems: TimelineItem[] = [
    {
      id: '1',
      type: 'activity',
      title: 'Visit Eiffel Tower',
      time: '09:00',
      category: 'culture',
      description: 'Visit the famous landmark',
      location: 'Paris',
    },
    {
      id: '2',
      type: 'meal',
      title: 'Lunch at Café',
      time: '12:00',
      category: 'food',
      description: 'Traditional French lunch',
      location: 'Paris',
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockUseDeleteConfirmation = {
    isOpen: false,
    itemToDelete: null,
    openDialog: vi.fn(),
    openDialogById: vi.fn(),
    closeDialog: vi.fn(),
    confirmDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mockReturnValue(mockUseDeleteConfirmation);
  });

  describe('rendering - empty state', () => {
    it('should show empty message when items array is empty', () => {
      render(<EventTimeline items={[]} />);

      expect(screen.getByTestId('empty-activities-message')).toBeInTheDocument();
      expect(screen.getByText('Brak zaplanowanych aktywności na ten dzień.')).toBeInTheDocument();
    });

    it('should not render timeline when items array is empty', () => {
      render(<EventTimeline items={[]} />);

      expect(screen.queryByTestId('plan-timeline')).not.toBeInTheDocument();
    });
  });

  describe('rendering - with items', () => {
    it('should render timeline container', () => {
      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('plan-timeline')).toBeInTheDocument();
    });

    it('should render all timeline items', () => {
      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const timelineItems = screen.getAllByTestId('timeline-item');
      expect(timelineItems).toHaveLength(2);
    });

    it('should render item titles', () => {
      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Visit Eiffel Tower')).toBeInTheDocument();
      expect(screen.getByText('Lunch at Café')).toBeInTheDocument();
    });

    it('should use default currency PLN when not provided', () => {
      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const currencyElements = screen.getAllByText('PLN');
      expect(currencyElements).toHaveLength(2);
    });

    it('should use provided currency', () => {
      render(<EventTimeline items={mockItems} currency='EUR' onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const currencyElements = screen.getAllByText('EUR');
      expect(currencyElements).toHaveLength(2);
    });

    it('should not show empty message when items exist', () => {
      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.queryByTestId('empty-activities-message')).not.toBeInTheDocument();
    });
  });

  describe('edit functionality', () => {
    it('should render edit buttons when onEdit is provided', () => {
      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(2);
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(<EventTimeline items={mockItems} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should not render edit buttons when onEdit is not provided', () => {
      render(<EventTimeline items={mockItems} />);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('delete functionality', () => {
    it('should render delete buttons when onDelete is provided', () => {
      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(2);
    });

    it('should call openDialogById when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOpenDialogById = vi.fn();

      vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mockReturnValue({
        ...mockUseDeleteConfirmation,
        openDialogById: mockOpenDialogById,
      });

      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(mockOpenDialogById).toHaveBeenCalledWith(mockItems, '1');
    });

    it('should not render delete buttons when onDelete is not provided', () => {
      render(<EventTimeline items={mockItems} />);

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('delete confirmation dialog', () => {
    it('should not show dialog when isOpen is false', () => {
      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
    });

    it('should show dialog when isOpen is true', () => {
      vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mockReturnValue({
        ...mockUseDeleteConfirmation,
        isOpen: true,
        itemToDelete: mockItems[0],
      });

      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    });

    it('should display item title in delete confirmation', () => {
      vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mockReturnValue({
        ...mockUseDeleteConfirmation,
        isOpen: true,
        itemToDelete: mockItems[0],
      });

      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      expect(screen.getByText('Usuń aktywność')).toBeInTheDocument();
      expect(
        screen.getByText(/Czy na pewno chcesz usunąć "Visit Eiffel Tower"\? Ta akcja jest nieodwracalna./)
      ).toBeInTheDocument();
    });

    it('should call confirmDelete when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const mockConfirmDelete = vi.fn();

      vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mockReturnValue({
        ...mockUseDeleteConfirmation,
        isOpen: true,
        itemToDelete: mockItems[0],
        confirmDelete: mockConfirmDelete,
      });

      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      const confirmButton = screen.getByTestId('confirm-delete');
      await user.click(confirmButton);

      expect(mockConfirmDelete).toHaveBeenCalled();
    });

    it('should have cancel button', () => {
      vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mockReturnValue({
        ...mockUseDeleteConfirmation,
        isOpen: true,
        itemToDelete: mockItems[0],
      });

      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('cancel-delete')).toBeInTheDocument();
      expect(screen.getByText('Anuluj')).toBeInTheDocument();
    });
  });

  describe('hook initialization', () => {
    it('should initialize useDeleteConfirmation hook with correct callback', () => {
      render(<EventTimeline items={mockItems} onDelete={mockOnDelete} />);

      expect(useDeleteConfirmationModule.useDeleteConfirmation).toHaveBeenCalledWith({
        onConfirm: expect.any(Function),
      });

      // Test the callback
      const hookCall = vi.mocked(useDeleteConfirmationModule.useDeleteConfirmation).mock.calls[0][0];
      hookCall.onConfirm(mockItems[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockItems[0].id);
    });
  });

  describe('edge cases', () => {
    it('should handle null items gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<EventTimeline items={null as any} />);

      expect(screen.getByTestId('empty-activities-message')).toBeInTheDocument();
    });

    it('should handle undefined items gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<EventTimeline items={undefined as any} />);

      expect(screen.getByTestId('empty-activities-message')).toBeInTheDocument();
    });
  });
});
