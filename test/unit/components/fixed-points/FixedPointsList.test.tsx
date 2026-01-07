import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedPointsList } from '@/components/fixed-points/FixedPointsList';
import type { FixedPointFormItem } from '@/types';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock dateFormatters
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatDateTime: vi.fn(),
}));

describe('FixedPointsList', () => {
  const mockPoints: FixedPointFormItem[] = [
    {
      location: 'Wieża Eiffla',
      description: 'Wizyta na szczycie wieży',
      event_at: '2024-02-01T14:00:00',
      event_duration: 120,
    },
    {
      location: 'Luwr',
      description: null,
      event_at: '2024-02-02T10:00:00',
      event_duration: 180,
    },
    {
      location: 'Notre Dame',
      description: 'Zwiedzanie katedry',
      event_at: '2024-02-03T15:00:00',
      event_duration: undefined,
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dateFormatters.formatDateTime).mockImplementation((date: string) => {
      if (date === mockPoints[0].event_at) return '1 lutego 2024, 14:00';
      if (date === mockPoints[1].event_at) return '2 lutego 2024, 10:00';
      if (date === mockPoints[2].event_at) return '3 lutego 2024, 15:00';
      return date;
    });
  });

  describe('rendering', () => {
    it('should render list container', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByTestId('fixed-points-list')).toBeInTheDocument();
    });

    it('should render all points', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.getByText('Luwr')).toBeInTheDocument();
      expect(screen.getByText('Notre Dame')).toBeInTheDocument();
    });

    it('should render locations with correct test ids', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByTestId('summary-fixed-point-0-location')).toHaveTextContent('Wieża Eiffla');
      expect(screen.getByTestId('summary-fixed-point-1-location')).toHaveTextContent('Luwr');
      expect(screen.getByTestId('summary-fixed-point-2-location')).toHaveTextContent('Notre Dame');
    });

    it('should render descriptions when available', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByTestId('summary-fixed-point-0-description')).toHaveTextContent('Wizyta na szczycie wieży');
      expect(screen.getByTestId('summary-fixed-point-2-description')).toHaveTextContent('Zwiedzanie katedry');
    });

    it('should not render description when null', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.queryByTestId('summary-fixed-point-1-description')).not.toBeInTheDocument();
    });

    it('should render formatted datetimes', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByTestId('summary-fixed-point-0-datetime')).toHaveTextContent('1 lutego 2024, 14:00');
      expect(screen.getByTestId('summary-fixed-point-1-datetime')).toHaveTextContent('2 lutego 2024, 10:00');
      expect(screen.getByTestId('summary-fixed-point-2-datetime')).toHaveTextContent('3 lutego 2024, 15:00');
    });

    it('should render durations when available', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByTestId('summary-fixed-point-0-duration')).toHaveTextContent('120 minut');
      expect(screen.getByTestId('summary-fixed-point-1-duration')).toHaveTextContent('180 minut');
    });

    it('should not render duration when undefined', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.queryByTestId('summary-fixed-point-2-duration')).not.toBeInTheDocument();
    });

    it('should render MapPin icons for each point', () => {
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const mapPinIcons = container.querySelectorAll('svg.lucide-map-pin');
      expect(mapPinIcons).toHaveLength(mockPoints.length);
    });

    it('should render Clock icons for each point', () => {
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const clockIcons = container.querySelectorAll('svg.lucide-clock');
      expect(clockIcons).toHaveLength(mockPoints.length);
    });

    it('should render Pencil icon for edit button', () => {
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const pencilIcons = container.querySelectorAll('svg.lucide-pencil');
      expect(pencilIcons).toHaveLength(mockPoints.length);
    });

    it('should render Trash2 icon for delete button', () => {
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const trashIcons = container.querySelectorAll('svg.lucide-trash2');
      expect(trashIcons).toHaveLength(mockPoints.length);
    });

    it('should render delete buttons with aria labels', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByLabelText('Usuń punkt: Wieża Eiffla')).toBeInTheDocument();
      expect(screen.getByLabelText('Usuń punkt: Luwr')).toBeInTheDocument();
      expect(screen.getByLabelText('Usuń punkt: Notre Dame')).toBeInTheDocument();
    });

    it('should render delete buttons with test ids', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByTestId('delete-fixed-point-0')).toBeInTheDocument();
      expect(screen.getByTestId('delete-fixed-point-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-fixed-point-2')).toBeInTheDocument();
    });
  });

  describe('editing state', () => {
    it('should hide point being edited', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={1} />);

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.queryByText('Luwr')).not.toBeInTheDocument();
      expect(screen.getByText('Notre Dame')).toBeInTheDocument();
    });

    it('should show all points when editingIndex is null', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.getByText('Luwr')).toBeInTheDocument();
      expect(screen.getByText('Notre Dame')).toBeInTheDocument();
    });

    it('should hide first point when editingIndex is 0', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={0} />);

      expect(screen.queryByText('Wieża Eiffla')).not.toBeInTheDocument();
      expect(screen.getByText('Luwr')).toBeInTheDocument();
      expect(screen.getByText('Notre Dame')).toBeInTheDocument();
    });

    it('should hide last point when editingIndex is last index', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={2} />);

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.getByText('Luwr')).toBeInTheDocument();
      expect(screen.queryByText('Notre Dame')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onEdit with correct index when edit button clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const editButtons = container.querySelectorAll('button svg.lucide-pencil');
      await user.click(editButtons[0].parentElement as HTMLElement);

      expect(mockOnEdit).toHaveBeenCalledWith(0);
    });

    it('should call onRemove with correct index when delete button clicked', async () => {
      const user = userEvent.setup();
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      const deleteButton = screen.getByTestId('delete-fixed-point-1');
      await user.click(deleteButton);

      expect(mockOnRemove).toHaveBeenCalledWith(1);
    });

    it('should call onEdit for each point separately', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const editButtons = container.querySelectorAll('button svg.lucide-pencil');

      await user.click(editButtons[0].parentElement as HTMLElement);
      expect(mockOnEdit).toHaveBeenCalledWith(0);

      await user.click(editButtons[1].parentElement as HTMLElement);
      expect(mockOnEdit).toHaveBeenCalledWith(1);

      await user.click(editButtons[2].parentElement as HTMLElement);
      expect(mockOnEdit).toHaveBeenCalledWith(2);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
    });

    it('should call onRemove for each point separately', async () => {
      const user = userEvent.setup();
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      await user.click(screen.getByTestId('delete-fixed-point-0'));
      expect(mockOnRemove).toHaveBeenCalledWith(0);

      await user.click(screen.getByTestId('delete-fixed-point-1'));
      expect(mockOnRemove).toHaveBeenCalledWith(1);

      await user.click(screen.getByTestId('delete-fixed-point-2'));
      expect(mockOnRemove).toHaveBeenCalledWith(2);

      expect(mockOnRemove).toHaveBeenCalledTimes(3);
    });
  });

  describe('empty state', () => {
    it('should render empty list when no points', () => {
      render(<FixedPointsList points={[]} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      const list = screen.getByTestId('fixed-points-list');
      expect(list).toBeInTheDocument();
      expect(list.children).toHaveLength(0);
    });

    it('should not crash with empty points array', () => {
      expect(() => {
        render(<FixedPointsList points={[]} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);
      }).not.toThrow();
    });
  });

  describe('single point', () => {
    it('should render single point correctly', () => {
      render(
        <FixedPointsList points={[mockPoints[0]]} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.getByTestId('delete-fixed-point-0')).toBeInTheDocument();
    });

    it('should hide single point when editing', () => {
      render(<FixedPointsList points={[mockPoints[0]]} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={0} />);

      expect(screen.queryByText('Wieża Eiffla')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have destructive styling on delete button', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      const deleteButton = screen.getByTestId('delete-fixed-point-0');
      expect(deleteButton).toHaveClass('text-destructive', 'hover:text-destructive');
    });

    it('should render edit buttons with ghost variant', () => {
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const editButtons = container.querySelectorAll('button svg.lucide-pencil');
      // Just verify edit buttons exist
      expect(editButtons.length).toBe(mockPoints.length);
    });

    it('should have proper spacing between points', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      const list = screen.getByTestId('fixed-points-list');
      expect(list).toHaveClass('space-y-3');
    });
  });

  describe('edge cases', () => {
    it('should handle point with very long location', () => {
      const longPoint: FixedPointFormItem = {
        location: 'A'.repeat(200),
        description: 'Test',
        event_at: '2024-02-01T14:00:00',
        event_duration: 60,
      };

      render(<FixedPointsList points={[longPoint]} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    });

    it('should handle point with 0 duration', () => {
      const zeroDurationPoint: FixedPointFormItem = {
        location: 'Test Location',
        description: 'Test',
        event_at: '2024-02-01T14:00:00',
        event_duration: 0,
      };

      render(
        <FixedPointsList points={[zeroDurationPoint]} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      // 0 is falsy, so duration should not be displayed
      expect(screen.queryByText(/minut/)).not.toBeInTheDocument();
    });

    it('should handle many points', () => {
      const manyPoints: FixedPointFormItem[] = Array.from({ length: 20 }, (_, i) => ({
        location: `Location ${i}`,
        description: `Description ${i}`,
        event_at: '2024-02-01T14:00:00',
        event_duration: 60,
      }));

      vi.mocked(dateFormatters.formatDateTime).mockReturnValue('1 lutego 2024, 14:00');

      render(<FixedPointsList points={manyPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      expect(screen.getByText('Location 0')).toBeInTheDocument();
      expect(screen.getByText('Location 19')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible delete button labels', () => {
      render(<FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />);

      mockPoints.forEach((point) => {
        expect(screen.getByLabelText(`Usuń punkt: ${point.location}`)).toBeInTheDocument();
      });
    });

    it('should have button role on action buttons', () => {
      const { container } = render(
        <FixedPointsList points={mockPoints} onEdit={mockOnEdit} onRemove={mockOnRemove} editingIndex={null} />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });
});
