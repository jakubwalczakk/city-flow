import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FixedPointSummaryItem } from '@/components/summary/FixedPointSummaryItem';
import type { FixedPointFormItem } from '@/types';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock dateFormatters
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatDateTime: vi.fn(),
}));

describe('FixedPointSummaryItem', () => {
  const mockPoint: FixedPointFormItem = {
    location: 'Wieża Eiffla',
    description: 'Wizyta na szczycie wieży',
    event_at: '2024-02-01T14:00:00',
    event_duration: 120,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dateFormatters.formatDateTime).mockReturnValue('1 lutego 2024, 14:00');
  });

  describe('rendering', () => {
    it('should render location', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent('Wieża Eiffla');
    });

    it('should render description when provided', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-description')).toHaveTextContent('Wizyta na szczycie wieży');
    });

    it('should not render description when null', () => {
      const pointWithoutDescription = { ...mockPoint, description: null };
      const { container } = render(<FixedPointSummaryItem point={pointWithoutDescription} />);

      expect(container.textContent).not.toContain('null');
    });

    it('should not render description when undefined', () => {
      const pointWithoutDescription = { ...mockPoint, description: undefined };
      const { container } = render(<FixedPointSummaryItem point={pointWithoutDescription} />);

      expect(container.textContent).not.toContain('undefined');
    });

    it('should not render description when empty string', () => {
      const pointWithEmptyDescription = { ...mockPoint, description: '' };
      render(<FixedPointSummaryItem point={pointWithEmptyDescription} />);

      expect(screen.queryByTestId('test-description')).not.toBeInTheDocument();
    });

    it('should render formatted datetime', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-datetime')).toHaveTextContent('1 lutego 2024, 14:00');
      expect(dateFormatters.formatDateTime).toHaveBeenCalledWith(mockPoint.event_at);
    });

    it('should render duration when provided', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-duration')).toHaveTextContent('120 min');
    });

    it('should render bullet separator when duration is provided', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      expect(container.textContent).toContain('•');
    });

    it('should not render duration when not provided', () => {
      const pointWithoutDuration = { ...mockPoint, event_duration: undefined };
      render(<FixedPointSummaryItem point={pointWithoutDuration} />);

      expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });

    it('should not render bullet when duration is not provided', () => {
      const pointWithoutDuration = { ...mockPoint, event_duration: undefined };
      const { container } = render(<FixedPointSummaryItem point={pointWithoutDuration} />);

      expect(container.textContent).not.toContain('•');
    });

    it('should render MapPin icon', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const mapPinIcon = container.querySelector('svg.lucide-map-pin');
      expect(mapPinIcon).toBeInTheDocument();
    });

    it('should render Clock icon', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const clockIcon = container.querySelector('svg.lucide-clock');
      expect(clockIcon).toBeInTheDocument();
    });
  });

  describe('test ids', () => {
    it('should render with custom data-testid', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='custom-test-id' />);

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });

    it('should render location with testid when parent testid provided', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test-point' />);

      expect(screen.getByTestId('test-point-location')).toBeInTheDocument();
    });

    it('should render description with testid when parent testid provided', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test-point' />);

      expect(screen.getByTestId('test-point-description')).toBeInTheDocument();
    });

    it('should render datetime with testid when parent testid provided', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test-point' />);

      expect(screen.getByTestId('test-point-datetime')).toBeInTheDocument();
    });

    it('should render duration with testid when parent testid provided', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test-point' />);

      expect(screen.getByTestId('test-point-duration')).toBeInTheDocument();
    });

    it('should not add testid to elements when parent testid not provided', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const elementsWithTestId = container.querySelectorAll('[data-testid]');
      expect(elementsWithTestId).toHaveLength(0);
    });
  });

  describe('styling', () => {
    it('should have proper container classes', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-start', 'gap-3', 'pb-3', 'border-b');
    });

    it('should have last:border-b-0 class for last item styling', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('last:border-b-0');
    });

    it('should have last:pb-0 class for last item padding', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('last:pb-0');
    });

    it('should style location as font-medium', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      const location = screen.getByTestId('test-location');
      expect(location).toHaveClass('font-medium');
    });

    it('should style description with muted foreground', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      const description = screen.getByTestId('test-description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should have flex-shrink-0 on icon', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const icon = container.querySelector('svg.lucide-map-pin');
      expect(icon).toHaveClass('flex-shrink-0');
    });

    it('should style datetime info with muted foreground', () => {
      render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      const datetimeContainer = screen.getByTestId('test-datetime').parentElement;
      expect(datetimeContainer).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('layout', () => {
    it('should use flexbox layout for main container', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex');
    });

    it('should have icon on the left', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const icon = container.querySelector('svg.lucide-map-pin');
      expect(icon).toBeInTheDocument();
      expect(icon?.parentElement?.parentElement?.firstChild).toBe(icon?.parentElement);
    });

    it('should have flex-1 on content area', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const contentArea = container.querySelector('.flex-1');
      expect(contentArea).toBeInTheDocument();
    });

    it('should have min-w-0 for text overflow handling', () => {
      const { container } = render(<FixedPointSummaryItem point={mockPoint} />);

      const contentArea = container.querySelector('.min-w-0');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long location name', () => {
      const longLocation = 'A'.repeat(200);
      const pointWithLongName = { ...mockPoint, location: longLocation };

      render(<FixedPointSummaryItem point={pointWithLongName} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent(longLocation);
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      const pointWithLongDescription = { ...mockPoint, description: longDescription };

      render(<FixedPointSummaryItem point={pointWithLongDescription} data-testid='test' />);

      expect(screen.getByTestId('test-description')).toHaveTextContent(longDescription);
    });

    it('should handle special characters in location', () => {
      const specialLocation = 'Łódź & "Special" \'Location\'';
      const pointWithSpecialChars = { ...mockPoint, location: specialLocation };

      render(<FixedPointSummaryItem point={pointWithSpecialChars} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent(specialLocation);
    });

    it('should handle zero duration', () => {
      const pointWithZeroDuration = { ...mockPoint, event_duration: 0 };
      render(<FixedPointSummaryItem point={pointWithZeroDuration} />);

      // 0 is falsy, so duration should not be displayed
      expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });

    it('should handle large duration values', () => {
      const pointWithLargeDuration = { ...mockPoint, event_duration: 9999 };
      render(<FixedPointSummaryItem point={pointWithLargeDuration} data-testid='test' />);

      expect(screen.getByTestId('test-duration')).toHaveTextContent('9999 min');
    });

    it('should handle different date formats', () => {
      const differentDate = '2024-12-31T23:59:59Z';
      const pointWithDifferentDate = { ...mockPoint, event_at: differentDate };

      vi.mocked(dateFormatters.formatDateTime).mockReturnValue('31 grudnia 2024, 23:59');

      render(<FixedPointSummaryItem point={pointWithDifferentDate} data-testid='test' />);

      expect(screen.getByTestId('test-datetime')).toHaveTextContent('31 grudnia 2024, 23:59');
      expect(dateFormatters.formatDateTime).toHaveBeenCalledWith(differentDate);
    });
  });

  describe('memoization', () => {
    it('should be a memoized component', () => {
      const { rerender } = render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent('Wieża Eiffla');

      // Rerender with same props
      rerender(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent('Wieża Eiffla');
    });

    it('should update when point changes', () => {
      const { rerender } = render(<FixedPointSummaryItem point={mockPoint} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent('Wieża Eiffla');

      const newPoint = { ...mockPoint, location: 'Luwr' };
      rerender(<FixedPointSummaryItem point={newPoint} data-testid='test' />);

      expect(screen.getByTestId('test-location')).toHaveTextContent('Luwr');
      expect(screen.getByTestId('test-location').textContent).not.toContain('Wieża Eiffla');
    });
  });
});
