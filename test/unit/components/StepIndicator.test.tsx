import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepIndicator } from '@/components/StepIndicator';

describe('StepIndicator', () => {
  const mockSteps = ['Informacje', 'Punkty', 'Podsumowanie'];

  describe('rendering', () => {
    it('should render all steps', () => {
      render(<StepIndicator currentStep={1} steps={mockSteps} />);

      expect(screen.getByTestId('step-label-1')).toBeInTheDocument();
      expect(screen.getByTestId('step-label-2')).toBeInTheDocument();
      expect(screen.getByTestId('step-label-3')).toBeInTheDocument();
    });

    it('should render step numbers', () => {
      render(<StepIndicator currentStep={1} steps={mockSteps} />);

      expect(screen.getByRole('button', { name: /krok 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /krok 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /krok 3/i })).toBeInTheDocument();
    });

    it('should highlight current step', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const buttons = container.querySelectorAll('button');
      const currentStepButton = buttons[1];

      expect(currentStepButton).toHaveAttribute('aria-current', 'step');
    });

    it('should disable upcoming steps', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons[2]).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('should call onStepClick when clicking completed step', async () => {
      const user = userEvent.setup();
      const mockOnStepClick = vi.fn();

      render(<StepIndicator currentStep={3} steps={mockSteps} onStepClick={mockOnStepClick} />);

      const step1Button = screen.getByRole('button', { name: /krok 1/i });
      await user.click(step1Button);

      expect(mockOnStepClick).toHaveBeenCalledWith(1);
    });

    it('should call onStepClick when clicking current step', async () => {
      const user = userEvent.setup();
      const mockOnStepClick = vi.fn();

      render(<StepIndicator currentStep={2} steps={mockSteps} onStepClick={mockOnStepClick} />);

      const step2Button = screen.getByRole('button', { name: /krok 2/i });
      await user.click(step2Button);

      expect(mockOnStepClick).toHaveBeenCalledWith(2);
    });

    it('should not call onStepClick when clicking upcoming step', async () => {
      const user = userEvent.setup();
      const mockOnStepClick = vi.fn();

      render(<StepIndicator currentStep={1} steps={mockSteps} onStepClick={mockOnStepClick} />);

      const step3Button = screen.getByRole('button', { name: /krok 3/i });
      await user.click(step3Button);

      expect(mockOnStepClick).not.toHaveBeenCalled();
    });

    it('should not be interactive without onStepClick prop', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels', () => {
      render(<StepIndicator currentStep={1} steps={mockSteps} />);

      expect(screen.getByRole('button', { name: /krok 1: informacje/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /krok 2: punkty/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /krok 3: podsumowanie/i })).toBeInTheDocument();
    });

    it('should mark current step with aria-current', () => {
      render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const step2Button = screen.getByRole('button', { name: /krok 2/i });
      expect(step2Button).toHaveAttribute('aria-current', 'step');
    });

    it('should not have aria-current for other steps', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons[1]).not.toHaveAttribute('aria-current');
      expect(buttons[2]).not.toHaveAttribute('aria-current');
    });
  });
});
