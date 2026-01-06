import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationsCounter } from '@/components/GenerationsCounter';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock date formatter
vi.mock('@/lib/utils/dateFormatters', () => ({
  getNextMonthResetDate: vi.fn(() => '1 lutego 2024'),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock UI components
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className, ...props }: any) => (
    <div data-testid='progress-bar' data-value={value} className={className} {...props}>
      Progress: {value}%
    </div>
  ),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('GenerationsCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render generations counter container', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      expect(screen.getByTestId('generations-counter')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      expect(screen.getByText('Limit generacji')).toBeInTheDocument();
    });

    it('should render generations count', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      expect(screen.getByTestId('generations-count')).toBeInTheDocument();
      expect(screen.getByText('Pozostało planów: 3/5')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      expect(screen.getByTestId('generations-progress')).toBeInTheDocument();
    });

    it('should render reset date', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      expect(screen.getByTestId('generations-reset-date')).toBeInTheDocument();
      expect(screen.getByText('Limit odnowi się 1 lutego 2024')).toBeInTheDocument();
    });

    it('should call getNextMonthResetDate', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      expect(dateFormatters.getNextMonthResetDate).toHaveBeenCalled();
    });
  });

  describe('progress bar values', () => {
    it('should calculate correct progress for 3 remaining generations', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '60'); // (3/5) * 100 = 60
    });

    it('should show 100% progress when all 5 generations remain', () => {
      render(<GenerationsCounter generationsRemaining={5} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '100');
    });

    it('should show 0% progress when no generations remain', () => {
      render(<GenerationsCounter generationsRemaining={0} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '0');
    });

    it('should show 20% progress for 1 remaining generation', () => {
      render(<GenerationsCounter generationsRemaining={1} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '20'); // (1/5) * 100 = 20
    });

    it('should show 40% progress for 2 remaining generations', () => {
      render(<GenerationsCounter generationsRemaining={2} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '40'); // (2/5) * 100 = 40
    });

    it('should show 80% progress for 4 remaining generations', () => {
      render(<GenerationsCounter generationsRemaining={4} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '80'); // (4/5) * 100 = 80
    });

    it('should have correct height class on progress bar', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('h-2');
    });
  });

  describe('counter display', () => {
    it('should display 0/5 when no generations remain', () => {
      render(<GenerationsCounter generationsRemaining={0} />);

      expect(screen.getByText('Pozostało planów: 0/5')).toBeInTheDocument();
    });

    it('should display 1/5 for 1 remaining generation', () => {
      render(<GenerationsCounter generationsRemaining={1} />);

      expect(screen.getByText('Pozostało planów: 1/5')).toBeInTheDocument();
    });

    it('should display 5/5 when all generations remain', () => {
      render(<GenerationsCounter generationsRemaining={5} />);

      expect(screen.getByText('Pozostało planów: 5/5')).toBeInTheDocument();
    });
  });

  describe('reset date', () => {
    it('should display reset date from formatter', () => {
      vi.mocked(dateFormatters.getNextMonthResetDate).mockReturnValue('15 marca 2024');

      render(<GenerationsCounter generationsRemaining={3} />);

      expect(screen.getByText('Limit odnowi się 15 marca 2024')).toBeInTheDocument();
    });

    it('should handle different date formats', () => {
      vi.mocked(dateFormatters.getNextMonthResetDate).mockReturnValue('1 stycznia 2025');

      render(<GenerationsCounter generationsRemaining={2} />);

      expect(screen.getByText('Limit odnowi się 1 stycznia 2025')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle negative generations gracefully', () => {
      render(<GenerationsCounter generationsRemaining={-1} />);

      expect(screen.getByText('Pozostało planów: -1/5')).toBeInTheDocument();
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '-20'); // (-1/5) * 100 = -20
    });

    it('should handle generations over maximum', () => {
      render(<GenerationsCounter generationsRemaining={10} />);

      expect(screen.getByText('Pozostało planów: 10/5')).toBeInTheDocument();
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '200'); // (10/5) * 100 = 200
    });

    it('should handle decimal generations', () => {
      render(<GenerationsCounter generationsRemaining={2.5} />);

      expect(screen.getByText('Pozostało planów: 2.5/5')).toBeInTheDocument();
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-value', '50'); // (2.5/5) * 100 = 50
    });
  });

  describe('component structure', () => {
    it('should have proper spacing classes', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      const counterDiv = screen.getByTestId('generations-counter');
      expect(counterDiv).toHaveClass('space-y-4');
    });

    it('should have title as h3 element', () => {
      const { container } = render(<GenerationsCounter generationsRemaining={3} />);

      const title = container.querySelector('h3');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Limit generacji');
    });

    it('should render all sections in correct order', () => {
      render(<GenerationsCounter generationsRemaining={3} />);

      const counter = screen.getByTestId('generations-counter');
      const children = Array.from(counter.children);

      // First child should contain the title and count
      expect(children[0].querySelector('h3')).toHaveTextContent('Limit generacji');
      expect(children[0]).toHaveTextContent('Pozostało planów');

      // Second child should be the progress bar
      expect(children[1]).toHaveAttribute('data-testid', 'progress-bar');

      // Third child should be the reset date
      expect(children[2]).toHaveAttribute('data-testid', 'generations-reset-date');
    });
  });
});
