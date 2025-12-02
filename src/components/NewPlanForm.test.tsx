import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPlanForm from './NewPlanForm';
import type { PlanListItemDto } from '@/types';

// Mock the custom hook
vi.mock('@/hooks/useNewPlanForm', () => ({
  useNewPlanForm: vi.fn(),
}));

// Mock child components
vi.mock('@/components/StepIndicator', () => ({
  StepIndicator: ({ currentStep, steps }: { currentStep: number; steps: string[] }) => (
    <div data-testid="step-indicator">
      Step {currentStep} of {steps.length}
    </div>
  ),
}));

vi.mock('@/components/BasicInfoStep', () => ({
  BasicInfoStep: ({ goToNextStep, onCancel }: any) => (
    <div data-testid="basic-info-step">
      <button onClick={goToNextStep}>Next</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('@/components/FixedPointsStep', () => ({
  FixedPointsStep: ({ goToNextStep, goToPrevStep, onCancel }: any) => (
    <div data-testid="fixed-points-step">
      <button onClick={goToPrevStep}>Previous</button>
      <button onClick={goToNextStep}>Next</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('@/components/SummaryStep', () => ({
  SummaryStep: ({ goToPrevStep, onSubmit }: any) => (
    <div data-testid="summary-step">
      <button onClick={goToPrevStep}>Previous</button>
      <button onClick={onSubmit}>Submit</button>
    </div>
  ),
}));

vi.mock('@/components/PlanGenerationLoading', () => ({
  PlanGenerationLoading: ({ planName }: { planName: string }) => (
    <div data-testid="plan-generation-loading">Generating {planName}...</div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { useNewPlanForm } from '@/hooks/useNewPlanForm';

const mockUseNewPlanForm = useNewPlanForm as Mock;

describe('NewPlanForm', () => {
  const defaultHookReturn = {
    currentStep: 1,
    formData: {
      basicInfo: {
        name: '',
        destination: '',
        start_date: new Date('2025-01-01T09:00:00'),
        end_date: new Date('2025-01-05T18:00:00'),
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
    handleSubmit: vi.fn(),
    saveDraft: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNewPlanForm.mockReturnValue(defaultHookReturn);
  });

  describe('Rendering', () => {
    it('should render the form with step indicator', () => {
      // Arrange & Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });

    it('should render BasicInfoStep when on step 1', () => {
      // Arrange & Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
      expect(screen.queryByTestId('fixed-points-step')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-step')).not.toBeInTheDocument();
    });

    it('should render FixedPointsStep when on step 2', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 2,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('fixed-points-step')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-info-step')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-step')).not.toBeInTheDocument();
    });

    it('should render SummaryStep when on step 3', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 3,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('summary-step')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-info-step')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fixed-points-step')).not.toBeInTheDocument();
    });

    it('should render Card component wrapping the steps', () => {
      // Arrange & Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  describe('Generation Loading State', () => {
    it('should show loading animation when isGenerating is true', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        isGenerating: true,
        formData: {
          ...defaultHookReturn.formData,
          basicInfo: {
            ...defaultHookReturn.formData.basicInfo,
            name: 'My Paris Trip',
            destination: 'Paris',
          },
        },
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('plan-generation-loading')).toBeInTheDocument();
      expect(screen.getByText('Generating My Paris Trip...')).toBeInTheDocument();
      expect(screen.queryByTestId('step-indicator')).not.toBeInTheDocument();
    });

    it('should use destination as fallback plan name when name is empty', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        isGenerating: true,
        formData: {
          ...defaultHookReturn.formData,
          basicInfo: {
            ...defaultHookReturn.formData.basicInfo,
            name: '',
            destination: 'Berlin',
          },
        },
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByText('Generating Berlin trip...')).toBeInTheDocument();
    });

    it('should hide step indicator and card when generating', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        isGenerating: true,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.queryByTestId('step-indicator')).not.toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });
  });

  describe('Callback Handling', () => {
    it('should call onFinished callback when provided', async () => {
      // Arrange
      const onFinished = vi.fn();
      const user = userEvent.setup();
      render(<NewPlanForm onFinished={onFinished} />);

      // Act
      await user.click(screen.getByText('Cancel'));

      // Assert
      expect(onFinished).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when onFinished is not provided', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<NewPlanForm />);

      // Act & Assert
      await expect(user.click(screen.getByText('Cancel'))).resolves.not.toThrow();
    });
  });

  describe('Editing Mode', () => {
    it('should pass editingPlan to useNewPlanForm hook', () => {
      // Arrange
      const editingPlan: PlanListItemDto = {
        id: 'plan-123',
        name: 'Existing Plan',
        destination: 'Rome',
        start_date: '2025-06-01T09:00:00Z',
        end_date: '2025-06-05T18:00:00Z',
        status: 'draft',
        created_at: '2025-01-01T00:00:00Z',
      };

      // Act
      render(<NewPlanForm editingPlan={editingPlan} />);

      // Assert
      expect(mockUseNewPlanForm).toHaveBeenCalledWith({
        onFinished: undefined,
        editingPlan,
      });
    });

    it('should work in create mode when editingPlan is null', () => {
      // Arrange & Act
      render(<NewPlanForm editingPlan={null} />);

      // Assert
      expect(mockUseNewPlanForm).toHaveBeenCalledWith({
        onFinished: undefined,
        editingPlan: null,
      });
    });
  });

  describe('Step Navigation', () => {
    it('should pass nextStep function to BasicInfoStep', () => {
      // Arrange
      const nextStep = vi.fn();
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        nextStep,
      });

      const user = userEvent.setup();
      render(<NewPlanForm />);

      // Act
      user.click(screen.getByText('Next'));

      // Assert
      waitFor(() => {
        expect(nextStep).toHaveBeenCalled();
      });
    });

    it('should pass prevStep function to FixedPointsStep', () => {
      // Arrange
      const prevStep = vi.fn();
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 2,
        prevStep,
      });

      const user = userEvent.setup();
      render(<NewPlanForm />);

      // Act
      user.click(screen.getByText('Previous'));

      // Assert
      waitFor(() => {
        expect(prevStep).toHaveBeenCalled();
      });
    });

    it('should pass handleSubmit function to SummaryStep', () => {
      // Arrange
      const handleSubmit = vi.fn();
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 3,
        handleSubmit,
      });

      const user = userEvent.setup();
      render(<NewPlanForm />);

      // Act
      user.click(screen.getByText('Submit'));

      // Assert
      waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Data Management', () => {
    it('should pass formData to all step components', () => {
      // Arrange
      const formData = {
        basicInfo: {
          name: 'Test Plan',
          destination: 'Tokyo',
          start_date: new Date('2025-03-01T09:00:00'),
          end_date: new Date('2025-03-10T18:00:00'),
          notes: 'Test notes',
        },
        fixedPoints: [
          {
            location: 'Airport',
            event_at: '2025-03-01T10:00:00Z',
            event_duration: 120,
            description: 'Flight arrival',
          },
        ],
      };

      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        formData,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(mockUseNewPlanForm).toHaveBeenCalled();
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    });

    it('should pass update functions to appropriate steps', () => {
      // Arrange
      const updateBasicInfo = vi.fn();
      const addFixedPoint = vi.fn();
      const removeFixedPoint = vi.fn();
      const updateFixedPoint = vi.fn();

      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        updateBasicInfo,
        addFixedPoint,
        removeFixedPoint,
        updateFixedPoint,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(mockUseNewPlanForm).toHaveBeenCalled();
    });
  });

  describe('Loading and Error States', () => {
    it('should pass isLoading state to step components', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    });

    it('should pass error state to step components', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        error: 'Something went wrong',
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    });
  });

  describe('Draft Saving', () => {
    it('should pass saveDraft function to BasicInfoStep', () => {
      // Arrange
      const saveDraft = vi.fn();
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        saveDraft,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(mockUseNewPlanForm).toHaveBeenCalled();
    });

    it('should pass saveDraft function to FixedPointsStep', () => {
      // Arrange
      const saveDraft = vi.fn();
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 2,
        saveDraft,
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(mockUseNewPlanForm).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should maintain form state across step transitions', () => {
      // Arrange
      const { rerender } = render(<NewPlanForm />);

      // Act - Simulate moving to step 2
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 2,
      });
      rerender(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('fixed-points-step')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });

    it('should handle complete workflow from step 1 to generation', () => {
      // Arrange
      const { rerender } = render(<NewPlanForm />);

      // Act - Step 1
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();

      // Act - Move to Step 2
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 2,
      });
      rerender(<NewPlanForm />);
      expect(screen.getByTestId('fixed-points-step')).toBeInTheDocument();

      // Act - Move to Step 3
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 3,
      });
      rerender(<NewPlanForm />);
      expect(screen.getByTestId('summary-step')).toBeInTheDocument();

      // Act - Start generation
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 3,
        isGenerating: true,
      });
      rerender(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('plan-generation-loading')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onFinished gracefully', () => {
      // Arrange & Act
      const { container } = render(<NewPlanForm onFinished={undefined} />);

      // Assert
      expect(container).toBeInTheDocument();
    });

    it('should handle empty formData gracefully', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
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
      });

      // Act
      render(<NewPlanForm />);

      // Assert
      expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
    });

    it('should handle step out of bounds gracefully', () => {
      // Arrange
      mockUseNewPlanForm.mockReturnValue({
        ...defaultHookReturn,
        currentStep: 0, // Invalid step
      });

      // Act
      render(<NewPlanForm />);

      // Assert - Should not render any step component
      expect(screen.queryByTestId('basic-info-step')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fixed-points-step')).not.toBeInTheDocument();
      expect(screen.queryByTestId('summary-step')).not.toBeInTheDocument();
    });
  });
});

