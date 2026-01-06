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

  describe('rendering', () => {
    it('should render heading', () => {
      render(<ForgotPasswordForm />);

      const heading = screen.getByTestId('auth-heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Resetuj hasło');
    });

    it('should render email input field', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByTestId('forgot-password-email-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByTestId('forgot-password-submit-btn');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Wyślij link resetujący');
    });

    it('should render login link', () => {
      render(<ForgotPasswordForm />);

      const loginLink = screen.getByTestId('login-link');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
      expect(loginLink).toHaveTextContent('Zaloguj się');
    });

    it('should show instructions text', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByTestId('instructions-text')).toBeInTheDocument();
      expect(screen.getByTestId('instructions-text')).toHaveTextContent('Pamiętasz hasło?');
    });
  });

  describe('user interactions', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should call resetPassword when form is submitted with valid email', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('loading state', () => {
    it('should disable form field during submission', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner on submit button during submission', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(<ForgotPasswordForm />);

      const submitButton = screen.getByTestId('forgot-password-submit-btn');
      const spinner = submitButton.querySelector('.animate-spin');

      expect(spinner).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error alert on failure', () => {
      const errorMessage = 'Email not found';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<ForgotPasswordForm />);

      const errorAlert = screen.getByTestId('error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });

    it('should not show error alert when no error', () => {
      render(<ForgotPasswordForm />);

      expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument();
    });

    it('should display the exact error message returned', () => {
      const errorMessage = 'Network error occurred';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<ForgotPasswordForm />);

      expect(screen.getByTestId('error-alert')).toHaveTextContent(errorMessage);
    });
  });

  describe('success state', () => {
    it('should display success message after successful submission', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const successAlert = screen.getByTestId('success-message');
        expect(successAlert).toBeInTheDocument();
        expect(successAlert).toHaveTextContent('Email został wysłany!');
      });
    });

    it('should show success instructions after successful submission', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-instructions')).toBeInTheDocument();
        const instructions = screen.getByTestId('success-instructions');
        expect(instructions).toHaveTextContent(/Sprawdź swoją skrzynkę odbiorczą/);
        expect(instructions).toHaveTextContent(/Link jest ważny przez 1 godzinę/);
      });
    });

    it('should show try again button in success state', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('try-again-button')).toBeInTheDocument();
      });
    });

    it('should show back to login link in success state', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const backLink = screen.getByTestId('back-to-login-link');
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/login');
      });
    });

    it('should return to form when try again button is clicked', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ForgotPasswordForm />);

      // Submit form to get to success state
      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByTestId('try-again-button')).toBeInTheDocument();
      });

      // Click try again
      const tryAgainButton = screen.getByTestId('try-again-button');
      await user.click(tryAgainButton);

      // Should return to form
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-submit-btn')).toBeInTheDocument();
      });
    });

    it('should hide form when in success state', async () => {
      mockResetPassword.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('forgot-password-email-input')).not.toBeInTheDocument();
        expect(screen.queryByTestId('forgot-password-submit-btn')).not.toBeInTheDocument();
        expect(screen.queryByTestId('auth-heading')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper label for email field', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should have email input with correct type', () => {
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByTestId('forgot-password-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});
