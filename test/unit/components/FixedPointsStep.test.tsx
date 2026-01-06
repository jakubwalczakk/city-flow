import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FixedPointsStep } from '@/components/FixedPointsStep';

vi.mock('@/components/FixedPointsList', () => ({
  FixedPointsList: () => <div data-testid='fixed-points-list'>List</div>,
}));

describe('FixedPointsStep', () => {
  it('should render fixed points list', () => {
    render(
      <FixedPointsStep
        fixedPoints={[]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        goToNextStep={vi.fn()}
        goToPrevStep={vi.fn()}
        isLoading={false}
        error={null}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByTestId('fixed-points-list')).toBeInTheDocument();
  });
});
