import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TravelPaceSelector } from '@/components/TravelPaceSelector';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock UI components
vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid='select-wrapper' data-value={value}>
      <button onClick={() => onValueChange?.('moderate')}>Trigger</button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid='select-content'>{children}</div>,
  SelectItem: ({ children, value, ...props }: any) => (
    <div data-value={value} {...props}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, id, ...props }: any) => (
    <div id={id} {...props}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Mock types
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    TRAVEL_PACE_LABELS: {
      slow: 'Wolne',
      moderate: 'Umiarkowane',
      intensive: 'Intensywne',
    },
  };
});
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('TravelPaceSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render travel pace selector container', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByTestId('travel-pace-selector')).toBeInTheDocument();
    });

    it('should render label', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByTestId('travel-pace-label')).toBeInTheDocument();
      expect(screen.getByText('Tempo zwiedzania')).toBeInTheDocument();
    });

    it('should render select trigger', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByTestId('travel-pace-trigger')).toBeInTheDocument();
    });

    it('should render placeholder when no value is selected', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByText('Wybierz tempo')).toBeInTheDocument();
    });

    it('should have correct id on trigger for label association', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const trigger = screen.getByTestId('travel-pace-trigger');
      const label = screen.getByTestId('travel-pace-label');

      expect(trigger).toHaveAttribute('id', 'travel-pace');
      expect(label).toHaveAttribute('for', 'travel-pace');
    });
  });

  describe('pace options', () => {
    it('should render all three pace options', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByTestId('travel-pace-slow')).toBeInTheDocument();
      expect(screen.getByTestId('travel-pace-moderate')).toBeInTheDocument();
      expect(screen.getByTestId('travel-pace-intensive')).toBeInTheDocument();
    });

    it('should display correct labels for each pace', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByText('Wolne')).toBeInTheDocument();
      expect(screen.getByText('Umiarkowane')).toBeInTheDocument();
      expect(screen.getByText('Intensywne')).toBeInTheDocument();
    });

    it('should have correct data-value attributes', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const slowOption = screen.getByTestId('travel-pace-slow');
      const moderateOption = screen.getByTestId('travel-pace-moderate');
      const intensiveOption = screen.getByTestId('travel-pace-intensive');

      expect(slowOption).toHaveAttribute('data-value', 'slow');
      expect(moderateOption).toHaveAttribute('data-value', 'moderate');
      expect(intensiveOption).toHaveAttribute('data-value', 'intensive');
    });
  });

  describe('value selection', () => {
    it('should display selected value', () => {
      render(<TravelPaceSelector value='moderate' onChange={mockOnChange} />);

      const selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', 'moderate');
    });

    it('should handle slow pace selection', () => {
      render(<TravelPaceSelector value='slow' onChange={mockOnChange} />);

      const selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', 'slow');
    });

    it('should handle intensive pace selection', () => {
      render(<TravelPaceSelector value='intensive' onChange={mockOnChange} />);

      const selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', 'intensive');
    });

    it('should handle null value', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const selectWrapper = screen.getByTestId('select-wrapper');
      // undefined is used in the component for null values
      expect(selectWrapper).toHaveAttribute('data-value', '');
    });
  });

  describe('onChange handling', () => {
    it('should call onChange when value is selected', async () => {
      const user = userEvent.setup();
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const trigger = screen.getByText('Trigger');
      await user.click(trigger);

      expect(mockOnChange).toHaveBeenCalledWith('moderate');
    });

    it('should cast value to TravelPace type', async () => {
      const user = userEvent.setup();
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const trigger = screen.getByText('Trigger');
      await user.click(trigger);

      // Verify the callback was called with a string value
      expect(mockOnChange).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('select content', () => {
    it('should render select content', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      expect(screen.getByTestId('select-content')).toBeInTheDocument();
    });

    it('should render all options inside content', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const content = screen.getByTestId('select-content');
      const slowOption = screen.getByTestId('travel-pace-slow');
      const moderateOption = screen.getByTestId('travel-pace-moderate');
      const intensiveOption = screen.getByTestId('travel-pace-intensive');

      expect(content).toContainElement(slowOption);
      expect(content).toContainElement(moderateOption);
      expect(content).toContainElement(intensiveOption);
    });
  });

  describe('accessibility', () => {
    it('should associate label with select trigger', () => {
      render(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      const label = screen.getByTestId('travel-pace-label');
      const trigger = screen.getByTestId('travel-pace-trigger');

      expect(label).toHaveAttribute('for', 'travel-pace');
      expect(trigger).toHaveAttribute('id', 'travel-pace');
    });
  });

  describe('edge cases', () => {
    it('should handle changing from one value to another', () => {
      const { rerender } = render(<TravelPaceSelector value='slow' onChange={mockOnChange} />);

      let selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', 'slow');

      rerender(<TravelPaceSelector value='intensive' onChange={mockOnChange} />);

      selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', 'intensive');
    });

    it('should handle changing from value to null', () => {
      const { rerender } = render(<TravelPaceSelector value='moderate' onChange={mockOnChange} />);

      let selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', 'moderate');

      rerender(<TravelPaceSelector value={null} onChange={mockOnChange} />);

      selectWrapper = screen.getByTestId('select-wrapper');
      expect(selectWrapper).toHaveAttribute('data-value', '');
    });
  });
});
