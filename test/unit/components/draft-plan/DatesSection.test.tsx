import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatesSection } from '@/components/draft-plan/DatesSection';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock dateFormatters
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatDateTimeLong: vi.fn(),
}));

describe('DatesSection', () => {
  const mockStartDate = '2024-02-01T10:00:00Z';
  const mockEndDate = '2024-02-07T18:00:00Z';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dateFormatters.formatDateTimeLong).mockImplementation((date: string) => {
      if (date === mockStartDate) return '1 lutego 2024, 10:00';
      if (date === mockEndDate) return '7 lutego 2024, 18:00';
      return date;
    });
  });

  describe('rendering', () => {
    it('should render card with title', () => {
      render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      expect(screen.getByText('Daty i godziny podróży')).toBeInTheDocument();
    });

    it('should render start date label', () => {
      render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      expect(screen.getByText('Początek')).toBeInTheDocument();
    });

    it('should render end date label', () => {
      render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      expect(screen.getByText('Koniec')).toBeInTheDocument();
    });

    it('should display formatted start date', () => {
      render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      expect(screen.getByText('1 lutego 2024, 10:00')).toBeInTheDocument();
    });

    it('should display formatted end date', () => {
      render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      expect(screen.getByText('7 lutego 2024, 18:00')).toBeInTheDocument();
    });

    it('should render calendar icons', () => {
      const { container } = render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      const icons = container.querySelectorAll('svg.lucide-calendar');
      expect(icons).toHaveLength(2);
    });

    it('should call formatDateTimeLong for both dates', () => {
      render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      expect(dateFormatters.formatDateTimeLong).toHaveBeenCalledWith(mockStartDate);
      expect(dateFormatters.formatDateTimeLong).toHaveBeenCalledWith(mockEndDate);
      expect(dateFormatters.formatDateTimeLong).toHaveBeenCalledTimes(2);
    });
  });

  describe('layout', () => {
    it('should have proper structure with two date items', () => {
      const { container } = render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      const dateItems = container.querySelectorAll('.flex.items-center.gap-2');
      expect(dateItems).toHaveLength(2);
    });

    it('should display dates in vertical layout', () => {
      const { container } = render(<DatesSection startDate={mockStartDate} endDate={mockEndDate} />);

      const flexContainer = container.querySelector('.flex.flex-col.gap-3');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle same start and end date', () => {
      const sameDate = '2024-02-01T10:00:00Z';
      vi.mocked(dateFormatters.formatDateTimeLong).mockReturnValue('1 lutego 2024, 10:00');

      render(<DatesSection startDate={sameDate} endDate={sameDate} />);

      const formattedDates = screen.getAllByText('1 lutego 2024, 10:00');
      expect(formattedDates).toHaveLength(2);
    });

    it('should handle different date formats', () => {
      const customStart = '2024-12-31T23:59:59Z';
      const customEnd = '2025-01-01T00:00:00Z';

      vi.mocked(dateFormatters.formatDateTimeLong)
        .mockReturnValueOnce('31 grudnia 2024, 23:59')
        .mockReturnValueOnce('1 stycznia 2025, 00:00');

      render(<DatesSection startDate={customStart} endDate={customEnd} />);

      expect(screen.getByText('31 grudnia 2024, 23:59')).toBeInTheDocument();
      expect(screen.getByText('1 stycznia 2025, 00:00')).toBeInTheDocument();
    });
  });
});
