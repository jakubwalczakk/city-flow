import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewPlanForm from '@/components/NewPlanForm';
import * as useNewPlanFormModule from '@/hooks/useNewPlanForm';

vi.mock('@/hooks/useNewPlanForm');
vi.mock('@/components/StepIndicator', () => ({ StepIndicator: () => <div data-testid='step-indicator'>Steps</div> }));
vi.mock('@/components/BasicInfoStep', () => ({
  BasicInfoStep: () => <div data-testid='basic-info-step'>BasicInfo</div>,
}));
vi.mock('@/components/FixedPointsStep', () => ({
  FixedPointsStep: () => <div data-testid='fixed-points-step'>FixedPoints</div>,
}));
vi.mock('@/components/SummaryStep', () => ({ SummaryStep: () => <div data-testid='summary-step'>Summary</div> }));
vi.mock('@/components/PlanGenerationLoading', () => ({
  PlanGenerationLoading: () => <div data-testid='loading'>Loading</div>,
}));

describe('NewPlanForm', () => {
  const defaultReturn = {
    currentStep: 0,
    formData: {
      basicInfo: {
        name: '',
        destination: '',
        start_date: new Date(),
        end_date: new Date(),
        notes: '',
      },
      fixedPoints: [],
    },
    isLoading: false,
    isGenerating: false,
    error: null,
    updateBasicInfo: vi.fn(),
    addFixedPoint: vi.fn(),
    removeFixedPoint: vi.fn(),
    updateFixedPoint: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    goToStep: vi.fn(),
    handleSubmit: vi.fn(),
    saveDraft: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useNewPlanFormModule.useNewPlanForm).mockReturnValue(defaultReturn);
  });

  it('should render step indicator', () => {
    render(<NewPlanForm />);
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
  });

  it('should render BasicInfoStep when currentStep is 0', () => {
    render(<NewPlanForm />);
    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
  });

  it('should render FixedPointsStep when currentStep is 1', () => {
    vi.mocked(useNewPlanFormModule.useNewPlanForm).mockReturnValue({ ...defaultReturn, currentStep: 1 });
    render(<NewPlanForm />);
    expect(screen.queryByTestId('fixed-points-step')).toBeInTheDocument();
    expect(screen.queryByTestId('basic-info-step')).not.toBeInTheDocument();
  });

  it('should render SummaryStep when currentStep is 2', () => {
    vi.mocked(useNewPlanFormModule.useNewPlanForm).mockReturnValue({ ...defaultReturn, currentStep: 2 });
    render(<NewPlanForm />);
    expect(screen.queryByTestId('summary-step')).toBeInTheDocument();
    expect(screen.queryByTestId('basic-info-step')).not.toBeInTheDocument();
  });

  it('should show loading animation when generating', () => {
    vi.mocked(useNewPlanFormModule.useNewPlanForm).mockReturnValue({ ...defaultReturn, isGenerating: true });
    render(<NewPlanForm />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
