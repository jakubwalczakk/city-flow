import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryStep } from '@/components/SummaryStep';

describe('SummaryStep', () => {
  const formData = {
    basicInfo: {
      name: 'Test',
      destination: 'Paris',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-07'),
      notes: '',
    },
    fixedPoints: [],
  };

  it('should render summary', () => {
    render(
      <SummaryStep formData={formData} goToPrevStep={vi.fn()} onSubmit={vi.fn()} isLoading={false} error={null} />
    );
    expect(screen.getByTestId('summary-destination')).toBeInTheDocument();
    expect(screen.getByTestId('summary-destination')).toHaveTextContent(/Paris/);
  });
});
