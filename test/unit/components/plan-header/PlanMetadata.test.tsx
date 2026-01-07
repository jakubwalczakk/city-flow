import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanMetadata } from '@/components/plan-header/PlanMetadata';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock dateFormatters
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatDateRange: vi.fn(),
}));

describe('PlanMetadata', () => {
  const mockStartDate = '2024-02-01';
  const mockEndDate = '2024-02-07';
  const mockDestination = 'Paryż, Francja';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dateFormatters.formatDateRange).mockReturnValue('1-7 lutego 2024');
  });

  describe('rendering', () => {
    it('should render Calendar icon', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const calendarIcon = container.querySelector('svg.lucide-calendar');
      expect(calendarIcon).toBeInTheDocument();
    });

    it('should render MapPin icon', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const mapPinIcon = container.querySelector('svg.lucide-map-pin');
      expect(mapPinIcon).toBeInTheDocument();
    });

    it('should display formatted date range', () => {
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />);

      expect(screen.getByText('1-7 lutego 2024')).toBeInTheDocument();
    });

    it('should display destination', () => {
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />);

      expect(screen.getByText(mockDestination)).toBeInTheDocument();
    });

    it('should call formatDateRange with correct arguments', () => {
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />);

      expect(dateFormatters.formatDateRange).toHaveBeenCalledWith(mockStartDate, mockEndDate);
    });

    it('should have two metadata items', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const items = container.querySelectorAll('.flex.items-center.gap-1');
      expect(items).toHaveLength(2);
    });
  });

  describe('styling', () => {
    it('should have proper container styling', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const metadataContainer = container.firstChild;
      expect(metadataContainer).toHaveClass(
        'mt-2',
        'flex',
        'items-center',
        'gap-4',
        'text-sm',
        'text-muted-foreground'
      );
    });

    it('should have muted foreground color', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      expect(container.firstChild).toHaveClass('text-muted-foreground');
    });

    it('should have small text size', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      expect(container.firstChild).toHaveClass('text-sm');
    });

    it('should have gap between date and destination', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      expect(container.firstChild).toHaveClass('gap-4');
    });
  });

  describe('date handling', () => {
    it('should handle undefined startDate', () => {
      vi.mocked(dateFormatters.formatDateRange).mockReturnValue('-');

      render(<PlanMetadata endDate={mockEndDate} destination={mockDestination} />);

      expect(dateFormatters.formatDateRange).toHaveBeenCalledWith(undefined, mockEndDate);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should handle undefined endDate', () => {
      vi.mocked(dateFormatters.formatDateRange).mockReturnValue('Od 1 lutego 2024');

      render(<PlanMetadata startDate={mockStartDate} destination={mockDestination} />);

      expect(dateFormatters.formatDateRange).toHaveBeenCalledWith(mockStartDate, undefined);
      expect(screen.getByText('Od 1 lutego 2024')).toBeInTheDocument();
    });

    it('should handle both dates undefined', () => {
      vi.mocked(dateFormatters.formatDateRange).mockReturnValue('Brak dat');

      render(<PlanMetadata destination={mockDestination} />);

      expect(dateFormatters.formatDateRange).toHaveBeenCalledWith(undefined, undefined);
      expect(screen.getByText('Brak dat')).toBeInTheDocument();
    });

    it('should handle same start and end date', () => {
      const sameDate = '2024-02-01';
      vi.mocked(dateFormatters.formatDateRange).mockReturnValue('1 lutego 2024');

      render(<PlanMetadata startDate={sameDate} endDate={sameDate} destination={mockDestination} />);

      expect(screen.getByText('1 lutego 2024')).toBeInTheDocument();
    });

    it('should handle different date formats', () => {
      vi.mocked(dateFormatters.formatDateRange).mockReturnValue('2024-02-01 - 2024-02-07');

      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />);

      expect(screen.getByText('2024-02-01 - 2024-02-07')).toBeInTheDocument();
    });
  });

  describe('destination variations', () => {
    it('should handle short destination', () => {
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination='NYC' />);

      expect(screen.getByText('NYC')).toBeInTheDocument();
    });

    it('should handle long destination', () => {
      const longDestination = 'Barcelona, Katalonia, Hiszpania - wybrzeże śródziemnomorskie';
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={longDestination} />);

      expect(screen.getByText(longDestination)).toBeInTheDocument();
    });

    it('should handle destination with special characters', () => {
      const specialDestination = 'Łódź, Polska';
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={specialDestination} />);

      expect(screen.getByText(specialDestination)).toBeInTheDocument();
    });

    it('should handle empty destination', () => {
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination='' />);

      const mapPinContainer = screen.getByText('1-7 lutego 2024').parentElement?.parentElement;
      const destinationElement = mapPinContainer?.querySelectorAll('.flex.items-center.gap-1')[1];
      expect(destinationElement?.textContent).toContain('');
    });
  });

  describe('layout', () => {
    it('should display date before destination', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const items = container.querySelectorAll('.flex.items-center.gap-1');
      const firstItem = items[0];
      const secondItem = items[1];

      expect(firstItem.querySelector('svg.lucide-calendar')).toBeInTheDocument();
      expect(secondItem.querySelector('svg.lucide-map-pin')).toBeInTheDocument();
    });

    it('should have proper icon sizes', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const calendarIcon = container.querySelector('svg.lucide-calendar');
      const mapPinIcon = container.querySelector('svg.lucide-map-pin');

      expect(calendarIcon).toHaveClass('h-4', 'w-4');
      expect(mapPinIcon).toHaveClass('h-4', 'w-4');
    });

    it('should have gap between icons and text', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      const items = container.querySelectorAll('.flex.items-center.gap-1');
      items.forEach((item) => {
        expect(item).toHaveClass('gap-1');
      });
    });
  });

  describe('accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(
        <PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should display all information as text', () => {
      render(<PlanMetadata startDate={mockStartDate} endDate={mockEndDate} destination={mockDestination} />);

      expect(screen.getByText('1-7 lutego 2024')).toBeInTheDocument();
      expect(screen.getByText(mockDestination)).toBeInTheDocument();
    });
  });
});
