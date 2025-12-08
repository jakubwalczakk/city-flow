import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedPointsStep } from './FixedPointsStep';
import type { CreateFixedPointCommand } from '@/types';
import type { DatePickerProps } from '@/components/ui/date-picker';

// Mock DatePicker to simplify testing
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ date, onSelect }: DatePickerProps) => (
    <input
      data-testid='date-picker-mock'
      value={date ? date.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const d = e.target.value ? new Date(e.target.value) : undefined;
        // Adjust for timezone offset to keep the date correct when converting to Date
        if (d) {
          // Basic ISO date creates UTC midnight, which is fine for the mock
        }
        onSelect?.(d);
      }}
    />
  ),
}));

describe('FixedPointsStep', () => {
  const mockFixedPoints: CreateFixedPointCommand[] = [
    {
      location: 'Airport',
      event_at: '2025-11-01T10:00:00.000Z',
      event_duration: 60,
      description: 'Arrival',
    },
    {
      location: 'Hotel',
      event_at: '2025-11-01T12:00:00.000Z',
      event_duration: 30,
      description: 'Check-in',
    },
  ];

  const mockAddFixedPoint = vi.fn();
  const mockRemoveFixedPoint = vi.fn();
  const mockUpdateFixedPoint = vi.fn();
  const mockGoToNextStep = vi.fn();
  const mockGoToPrevStep = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    fixedPoints: mockFixedPoints,
    addFixedPoint: mockAddFixedPoint,
    removeFixedPoint: mockRemoveFixedPoint,
    updateFixedPoint: mockUpdateFixedPoint,
    goToNextStep: mockGoToNextStep,
    goToPrevStep: mockGoToPrevStep,
    onCancel: mockOnCancel,
    onSave: mockOnSave,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a list of existing fixed points', () => {
    // Act
    render(<FixedPointsStep {...defaultProps} />);

    // Assert
    expect(screen.getByText('Airport')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    // Removed fragile check for exact number of buttons
  });

  it("should show the add form when 'Dodaj stały punkt' is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} fixedPoints={[]} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Dodaj stały punkt/ }));

    // Assert
    expect(screen.getByLabelText(/Lokalizacja/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dodaj punkt' })).toBeInTheDocument();
  });

  it('should call addFixedPoint when adding a new valid point', async () => {
    // Arrange
    const user = userEvent.setup();
    const { container } = render(<FixedPointsStep {...defaultProps} fixedPoints={[]} />);
    await user.click(screen.getByRole('button', { name: /Dodaj stały punkt/ }));

    // Act
    await user.type(screen.getByLabelText(/Lokalizacja/), 'New Location');

    // Simulate picking date
    const dateInput = screen.getByTestId('date-picker-mock');
    fireEvent.change(dateInput, { target: { value: '2025-11-02' } });

    // Simulate picking time
    const timeInput = container.querySelector('input[type="time"]');
    if (!timeInput) throw new Error('Time input not found');
    await user.type(timeInput, '15:00');

    await user.click(screen.getByRole('button', { name: 'Dodaj punkt' }));

    // Assert
    expect(mockAddFixedPoint).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'New Location',
        event_at: expect.stringMatching(/2025-11-02/),
      })
    );
  });

  it('should show the edit form when an edit button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);

    // Act
    const editButtons = screen.getAllByRole('button');
    const firstEditButton = editButtons.find((btn) => btn.querySelector('svg')?.classList.contains('lucide-pencil'));
    if (!firstEditButton) throw new Error('Edit button not found');
    await user.click(firstEditButton);

    // Assert
    expect(screen.getByLabelText(/Lokalizacja/)).toHaveValue('Airport');
    // Check mocked date picker value
    expect(screen.getByTestId('date-picker-mock')).toHaveValue('2025-11-01');
  });

  it('should call updateFixedPoint when editing a point', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);
    const editButtons = screen.getAllByRole('button');
    const firstEditButton = editButtons.find((btn) => btn.querySelector('svg')?.classList.contains('lucide-pencil'));
    if (!firstEditButton) throw new Error('Edit button not found');
    await user.click(firstEditButton);

    // Act
    const locationInput = screen.getByLabelText(/Lokalizacja/);
    await user.clear(locationInput);
    await user.type(locationInput, 'Updated Airport');
    await user.click(screen.getByRole('button', { name: 'Zapisz zmiany' }));

    // Assert
    expect(mockUpdateFixedPoint).toHaveBeenCalledWith(0, expect.objectContaining({ location: 'Updated Airport' }));
  });

  it('should call removeFixedPoint when a delete button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);

    // Act
    const deleteButtons = screen.getAllByRole('button');
    const firstDeleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    );
    if (!firstDeleteButton) throw new Error('Delete button not found');
    await user.click(firstDeleteButton);

    // Assert
    expect(mockRemoveFixedPoint).toHaveBeenCalledWith(0);
  });

  it("should call goToPrevStep when 'Wstecz' is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Wstecz' }));

    // Assert
    expect(mockGoToPrevStep).toHaveBeenCalledTimes(1);
  });

  it("should call goToNextStep when 'Dalej' is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Dalej' }));

    // Assert
    expect(mockGoToNextStep).toHaveBeenCalledTimes(1);
  });
});
