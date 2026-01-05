import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryStep } from './SummaryStep';
import type { NewPlanViewModel } from '@/types';

// Mock dateFormatters to return predictable strings
vi.mock('@/lib/utils/dateFormatters', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils/dateFormatters')>();
  return {
    ...actual,
    formatDateObjectLong: (date: Date) => `Formatted: ${date.toISOString()}`,
    formatDateTime: (isoString: string) => `Formatted: ${isoString}`,
  };
});

describe('SummaryStep', () => {
  const mockFormData: NewPlanViewModel = {
    basicInfo: {
      name: 'Trip to the Future',
      destination: 'Future City',
      start_date: new Date('2099-01-01T12:00:00Z'),
      end_date: new Date('2099-01-05T20:00:00Z'),
      notes: 'Bring a time machine.',
    },
    fixedPoints: [
      {
        location: 'Time Port',
        event_at: '2099-01-01T12:00:00Z',
        event_duration: 120,
        description: 'Arrival',
      },
      {
        location: 'Cyber Hotel',
        event_at: '2099-01-01T14:00:00Z',
        event_duration: 45,
        description: 'Check-in',
      },
    ],
  };

  const defaultProps = {
    formData: mockFormData,
    goToPrevStep: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
    error: null,
  };

  it('should render all basic information correctly', () => {
    // Act
    render(<SummaryStep {...defaultProps} />);

    // Assert
    expect(screen.getByTestId('summary-plan-name')).toHaveTextContent('Trip to the Future');
    expect(screen.getByTestId('summary-destination')).toHaveTextContent('Future City');
    expect(screen.getByTestId('summary-notes')).toHaveTextContent('Bring a time machine.');
    // Check for mocked date formats (multiple instances for start and end dates)
    expect(screen.getAllByText(/Formatted:/).length).toBeGreaterThan(0);
  });

  it('should render all fixed points correctly', () => {
    // Act
    render(<SummaryStep {...defaultProps} />);

    // Assert
    expect(screen.getByTestId('summary-fixed-point-0-location')).toHaveTextContent('Time Port');
    expect(screen.getByTestId('summary-fixed-point-0-description')).toHaveTextContent('Arrival');
    expect(screen.getByTestId('summary-fixed-point-1-location')).toHaveTextContent('Cyber Hotel');
    expect(screen.getByTestId('summary-fixed-point-1-description')).toHaveTextContent('Check-in');
    expect(screen.getByTestId('summary-fixed-point-0-duration')).toHaveTextContent('120 min');
  });

  it('should display a message when there are no fixed points', () => {
    // Arrange
    const noFixedPointsData = {
      ...mockFormData,
      fixedPoints: [],
    };
    const props = { ...defaultProps, formData: noFixedPointsData };

    // Act
    render(<SummaryStep {...props} />);

    // Assert
    expect(screen.getByTestId('summary-no-fixed-points')).toHaveTextContent(/Nie dodano stałych punktów/);
  });

  it('should display a message when there are no notes', () => {
    // Arrange
    const noNotesData = {
      ...mockFormData,
      basicInfo: { ...mockFormData.basicInfo, notes: '' },
    };
    const props = { ...defaultProps, formData: noNotesData };

    // Act
    render(<SummaryStep {...props} />);

    // Assert
    expect(screen.queryByText('Notatki')).not.toBeInTheDocument();
    expect(screen.queryByText('Bring a time machine.')).not.toBeInTheDocument();
  });

  it('should display an error message if one is provided', () => {
    // Act
    render(<SummaryStep {...defaultProps} error='An error has occurred.' />);

    // Assert
    expect(screen.getByTestId('summary-error-message')).toHaveTextContent('An error has occurred.');
  });

  it('should show loading state in the submit button when isLoading is true', () => {
    // Act
    render(<SummaryStep {...defaultProps} isLoading={true} />);

    // Assert
    expect(screen.getByRole('button', { name: /Tworzenie planu/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Wstecz' })).toBeDisabled();
  });
});
