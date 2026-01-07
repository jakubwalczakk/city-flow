import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import * as useAuthModule from '@/hooks/useAuth';

// Mock useAuth hook (used by useForgotPasswordForm)
vi.mock('@/hooks/useAuth');

describe('ForgotPasswordForm', () => {
  const mockResetPassword = vi.fn();

  const defaultAuthState = {
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: mockResetPassword,
    updatePassword: vi.fn(),
    isLoading: false,
    error: null,
    success: null,
    clearError: vi.fn(),
    clearSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(defaultAuthState);
  });

  describe('Initial state', () => {
    it('renders form with email input and submit button', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByTestId('auth-heading')).toHaveTextContent('Resetuj hasło');
      expect(screen.getByTestId('forgot-password-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password-submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('login-link')).toHaveAttribute('href', '/login');
    });

    it('displays instructions text', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByTestId('instructions-text')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('disables input and shows loading spinner when submitting', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Wyślij link resetujący')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('displays error alert when error occurs', () => {
      const errorMessage = 'Invalid email address';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<ForgotPasswordForm />);

      expect(screen.getByTestId('error-alert')).toHaveTextContent(errorMessage);
    });

    it('does not display error alert when no error', () => {
      render(<ForgotPasswordForm />);

      expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    it('displays success message when email is sent successfully', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });

      expect(screen.getByText('Email został wysłany!')).toBeInTheDocument();
      expect(screen.getByTestId('success-instructions')).toBeInTheDocument();
    });

    it('hides form when success is true', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('forgot-password-email-input')).not.toBeInTheDocument();
      });

      expect(screen.queryByTestId('forgot-password-submit-btn')).not.toBeInTheDocument();
    });

    it('displays try again button that resets success state', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('try-again-button')).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByTestId('try-again-button');
      await user.click(tryAgainButton);

      // Form should be visible again
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-email-input')).toBeInTheDocument();
      });
    });

    it('displays back to login link in success state', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('back-to-login-link')).toBeInTheDocument();
      });

      expect(screen.getByTestId('back-to-login-link')).toHaveAttribute('href', '/login');
    });
  });
});
