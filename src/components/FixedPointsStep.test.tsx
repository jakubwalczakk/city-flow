import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedPointsStep } from './FixedPointsStep';
import type { CreateFixedPointCommand } from '@/types';
import type { DatePickerProps } from '@/components/ui/date-picker';

// Mock DatePicker to simplify testing
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ date, onSelect, 'data-testid': testId }: DatePickerProps & { 'data-testid'?: string }) => (
    <input
      type='date'
      data-testid={testId || 'date-picker-mock'}
      value={date ? date.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const value = e.target.value;
        if (value) {
          // Create date in local timezone to avoid UTC conversion issues
          const [year, month, day] = value.split('-').map(Number);
          const d = new Date(year, month - 1, day);
          onSelect?.(d);
        } else {
          onSelect?.(undefined);
        }
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
    expect(screen.getByTestId('summary-fixed-point-0-location')).toHaveTextContent('Airport');
    expect(screen.getByTestId('summary-fixed-point-1-location')).toHaveTextContent('Hotel');
  });

  it("should show the add form when 'Dodaj stały punkt' is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} fixedPoints={[]} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Dodaj stały punkt/ }));

    // Assert - Use testId since React Hook Form Controller may not work with getByLabelText
    expect(screen.getByTestId('fixed-point-location-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-fixed-point-btn')).toBeInTheDocument();
  });

  it('should call addFixedPoint when adding a new valid point', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} fixedPoints={[]} />);
    await user.click(screen.getByRole('button', { name: /Dodaj stały punkt/ }));

    // Act - Wait for form to be visible
    const locationInput = await screen.findByTestId('fixed-point-location-input');
    await user.type(locationInput, 'New Location');

    // Wait for React Hook Form to process the input
    await waitFor(() => {
      expect(locationInput).toHaveValue('New Location');
    });

    // Get the input elements
    const dateInput = screen.getByTestId('fixed-point-date-picker');
    const timeInput = screen.getByLabelText(/godzina/i);

    // Simulate picking date - interact with the date input
    await user.click(dateInput);
    await user.clear(dateInput);
    await user.type(dateInput, '2025-11-02');

    // Simulate picking time
    await user.click(timeInput);
    await user.clear(timeInput);
    await user.type(timeInput, '15:00');

    // Give React Hook Form time to process the changes
    await waitFor(() => {
      expect(locationInput).toHaveValue('New Location');
    });

    // Click submit button
    const submitButton = screen.getByTestId('save-fixed-point-btn');
    await user.click(submitButton);

    // Assert with waitFor to ensure async operations complete
    await waitFor(
      () => {
        expect(mockAddFixedPoint).toHaveBeenCalled();
        const call = mockAddFixedPoint.mock.calls[0]?.[0];
        expect(call).toMatchObject({
          location: 'New Location',
        });
        // Verify we got some date value (the exact date might vary due to mock implementation)
        expect(call.event_at).toBeDefined();
      },
      { timeout: 3000 }
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

    // Assert - Use testId for location input
    expect(screen.getByTestId('fixed-point-location-input')).toHaveValue('Airport');
    // Check mocked date picker value
    expect(screen.getByTestId('fixed-point-date-picker')).toHaveValue('2025-11-01');
  });

  it('should call updateFixedPoint when editing a point', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);
    const editButtons = screen.getAllByRole('button');
    const firstEditButton = editButtons.find((btn) => btn.querySelector('svg')?.classList.contains('lucide-pencil'));
    if (!firstEditButton) throw new Error('Edit button not found');
    await user.click(firstEditButton);

    // Wait for form to be populated
    const locationInput = await screen.findByTestId('fixed-point-location-input');
    await waitFor(() => {
      expect(locationInput).toHaveValue('Airport');
    });

    // Act
    await user.clear(locationInput);
    await user.type(locationInput, 'Updated Airport');

    // Wait for form to validate
    await waitFor(() => {
      expect(locationInput).toHaveValue('Updated Airport');
    });

    // Click submit and wait for callback
    const submitButton = screen.getByTestId('save-fixed-point-btn');
    await user.click(submitButton);

    // Assert with waitFor and longer timeout for async operations
    await waitFor(
      () => {
        expect(mockUpdateFixedPoint).toHaveBeenCalledWith(0, expect.objectContaining({ location: 'Updated Airport' }));
      },
      { timeout: 3000 }
    );
  });

  it('should call removeFixedPoint when a delete button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FixedPointsStep {...defaultProps} />);

    // Act
    const deleteButton = screen.getByTestId('delete-fixed-point-0');
    await user.click(deleteButton);

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
    await user.click(screen.getByTestId('fixed-points-next-button'));

    // Assert
    expect(mockGoToNextStep).toHaveBeenCalledTimes(1);
  });
});
