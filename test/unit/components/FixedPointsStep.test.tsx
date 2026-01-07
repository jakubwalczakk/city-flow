import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FixedPointsStep } from '@/components/FixedPointsStep';

describe('FixedPointsStep', () => {
  it('should render fixed points list', () => {
    render(
      <FixedPointsStep
        fixedPoints={[]}
        addFixedPoint={vi.fn()}
        removeFixedPoint={vi.fn()}
        updateFixedPoint={vi.fn()}
        goToNextStep={vi.fn()}
        goToPrevStep={vi.fn()}
        onCancel={vi.fn()}
        isLoading={false}
        error={null}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByTestId('fixed-points-list')).toBeInTheDocument();
  });
});
