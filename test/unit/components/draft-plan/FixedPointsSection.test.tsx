import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedPointsSection } from '@/components/draft-plan/FixedPointsSection';
import type { FixedPointDto } from '@/types';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock dateFormatters
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatDateTime: vi.fn(),
}));

describe('FixedPointsSection', () => {
  const mockOnEdit = vi.fn();

  const mockFixedPoints: FixedPointDto[] = [
    {
      id: 'fp-1',
      plan_id: 'plan-1',
      location: 'Wieża Eiffla',
      description: 'Wizyta na szczycie wieży',
      event_at: '2024-02-01T14:00:00Z',
      event_duration: 120,
    },
    {
      id: 'fp-2',
      plan_id: 'plan-1',
      location: 'Luwr',
      description: null,
      event_at: '2024-02-02T10:00:00Z',
      event_duration: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dateFormatters.formatDateTime).mockImplementation((date: string) => {
      if (date === mockFixedPoints[0].event_at) return '1 lutego 2024, 14:00';
      if (date === mockFixedPoints[1].event_at) return '2 lutego 2024, 10:00';
      return date;
    });
  });

  describe('rendering', () => {
    it('should render card title', () => {
      render(<FixedPointsSection fixedPoints={[]} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('Stałe punkty')).toBeInTheDocument();
    });

    it('should render card description', () => {
      render(<FixedPointsSection fixedPoints={[]} isLoading={false} onEdit={mockOnEdit} />);

      expect(
        screen.getByText(/Zablokowane zobowiązania w twoim planie, takie jak loty, rezerwacje hotelowe/)
      ).toBeInTheDocument();
    });

    it('should render edit button', () => {
      render(<FixedPointsSection fixedPoints={[]} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByRole('button', { name: /edytuj plan/i })).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<FixedPointsSection fixedPoints={[]} isLoading={true} onEdit={mockOnEdit} />);

      expect(screen.getByText('Ładowanie stałych punktów...')).toBeInTheDocument();
    });

    it('should display empty state when no fixed points', () => {
      render(<FixedPointsSection fixedPoints={[]} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText(/Nie dodano stałych punktów. Możesz edytować plan, aby je dodać./)).toBeInTheDocument();
    });

    it('should render fixed points list', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.getByText('Luwr')).toBeInTheDocument();
    });

    it('should render fixed point descriptions when available', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('Wizyta na szczycie wieży')).toBeInTheDocument();
    });

    it('should not render description when null', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      const luvrPoint = screen.getByText('Luwr').parentElement;
      expect(luvrPoint?.textContent).not.toContain('null');
    });

    it('should render formatted event times', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('1 lutego 2024, 14:00')).toBeInTheDocument();
      expect(screen.getByText('2 lutego 2024, 10:00')).toBeInTheDocument();
    });

    it('should render event duration when greater than 0', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('120 min')).toBeInTheDocument();
    });

    it('should not render duration when 0', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      // The second point has duration 0, so should not show "0 min"
      const allText = screen.getByText('Luwr').parentElement?.textContent || '';
      expect(allText).not.toContain('0 min');
    });

    it('should render MapPin icons for each fixed point', () => {
      const { container } = render(
        <FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />
      );

      const mapPinIcons = container.querySelectorAll('svg.lucide-map-pin');
      expect(mapPinIcons).toHaveLength(mockFixedPoints.length);
    });

    it('should render Clock icons for each fixed point', () => {
      const { container } = render(
        <FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />
      );

      const clockIcons = container.querySelectorAll('svg.lucide-clock');
      expect(clockIcons).toHaveLength(mockFixedPoints.length);
    });
  });

  describe('interactions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<FixedPointsSection fixedPoints={[]} isLoading={false} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edytuj plan/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit even when loading', async () => {
      const user = userEvent.setup();
      render(<FixedPointsSection fixedPoints={[]} isLoading={true} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edytuj plan/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit when there are fixed points', async () => {
      const user = userEvent.setup();
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edytuj plan/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle fixed point without duration (null)', () => {
      const pointWithoutDuration: FixedPointDto = {
        id: 'fp-3',
        plan_id: 'plan-1',
        location: 'Notre Dame',
        description: 'Quick visit',
        event_at: '2024-02-03T12:00:00Z',
        event_duration: null,
      };

      vi.mocked(dateFormatters.formatDateTime).mockReturnValue('3 lutego 2024, 12:00');

      render(<FixedPointsSection fixedPoints={[pointWithoutDuration]} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('Notre Dame')).toBeInTheDocument();
      const pointElement = screen.getByText('Notre Dame').parentElement;
      expect(pointElement?.textContent).not.toContain('min');
    });

    it('should handle single fixed point', () => {
      render(<FixedPointsSection fixedPoints={[mockFixedPoints[0]]} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('Wieża Eiffla')).toBeInTheDocument();
      expect(screen.queryByText('Luwr')).not.toBeInTheDocument();
    });

    it('should handle many fixed points', () => {
      const manyPoints: FixedPointDto[] = Array.from({ length: 10 }, (_, i) => ({
        id: `fp-${i}`,
        plan_id: 'plan-1',
        location: `Location ${i}`,
        description: `Description ${i}`,
        event_at: '2024-02-01T14:00:00Z',
        event_duration: 60,
      }));

      vi.mocked(dateFormatters.formatDateTime).mockReturnValue('1 lutego 2024, 14:00');

      render(<FixedPointsSection fixedPoints={manyPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('Location 0')).toBeInTheDocument();
      expect(screen.getByText('Location 9')).toBeInTheDocument();
    });

    it('should not show loading state when not loading', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.queryByText('Ładowanie stałych punktów...')).not.toBeInTheDocument();
    });

    it('should not show empty state when there are fixed points', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.queryByText(/Nie dodano stałych punktów/)).not.toBeInTheDocument();
    });

    it('should prioritize loading state over content', () => {
      render(<FixedPointsSection fixedPoints={mockFixedPoints} isLoading={true} onEdit={mockOnEdit} />);

      expect(screen.getByText('Ładowanie stałych punktów...')).toBeInTheDocument();
      expect(screen.queryByText('Wieża Eiffla')).not.toBeInTheDocument();
    });
  });
});
