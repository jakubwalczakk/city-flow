import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryStep } from '@/components/SummaryStep';

describe('SummaryStep', () => {
  const formData = {
    basicInfo: { name: 'Test', destination: 'Paris', start_date: '2024-01-01', end_date: '2024-01-07', notes: '' },
    fixedPoints: [],
  };

  it('should render summary', () => {
    render(
      <SummaryStep formData={formData} goToPrevStep={vi.fn()} onSubmit={vi.fn()} isSubmitting={false} error={null} />
    );
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
  });
});
