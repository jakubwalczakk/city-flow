import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordUpdateForm } from '@/components/auth/password-update/PasswordUpdateForm';

describe('PasswordUpdateForm', () => {
  const mockOnSubmit = vi.fn();

  describe('Rendering', () => {
    it('renders password input fields', () => {
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

      expect(screen.getByTestId('update-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('update-password-confirm-input')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

      const submitButton = screen.getByTestId('update-password-submit-btn');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Ustaw nowe hasło');
    });

    it('renders form labels', () => {
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

      expect(screen.getByText('Nowe hasło')).toBeInTheDocument();
      expect(screen.getByText('Potwierdź nowe hasło')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('disables inputs and button when loading', () => {
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={true} error={null} />);

      const passwordInput = screen.getByTestId('update-password-input');
      const confirmInput = screen.getByTestId('update-password-confirm-input');
      const submitButton = screen.getByTestId('update-password-submit-btn');

      expect(passwordInput).toBeDisabled();
      expect(confirmInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('shows loading spinner when submitting', () => {
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={true} error={null} />);

      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('displays error alert when error is provided', () => {
      const errorMessage = 'Password update failed';
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={false} error={errorMessage} />);

      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });

    it('does not display error alert when error is null', () => {
      render(<PasswordUpdateForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
