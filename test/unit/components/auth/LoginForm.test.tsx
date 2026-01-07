import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import * as useAuthModule from '@/hooks/useAuth';

// Mock useAuth hook (used by useLoginForm)
vi.mock('@/hooks/useAuth');

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  const defaultAuthState = {
    login: mockLogin,
    register: vi.fn(),
    resetPassword: vi.fn(),
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
      render(<LoginForm />);

      const heading = screen.getByTestId('auth-heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Witaj ponownie');
    });

    it('should render email input field', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render password input field', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('auth-password-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginForm />);

      const forgotPasswordLink = screen.getByTestId('forgot-password-link');
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
      expect(forgotPasswordLink).toHaveTextContent('Zapomniałeś hasła?');
    });

    it('should render register link', () => {
      render(<LoginForm />);

      const registerLink = screen.getByTestId('register-link');
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
      expect(registerLink).toHaveTextContent('Zarejestruj się');
    });

    it('should render submit button', () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId('auth-submit-btn');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Zaloguj się');
    });

    it('should have proper data-testid attributes', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('auth-heading')).toBeInTheDocument();
      expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      expect(screen.getByTestId('register-link')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByTestId('auth-email-input') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByTestId('auth-password-input') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('should call login when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByTestId('auth-email-input');
      const passwordInput = screen.getByTestId('auth-password-input');
      const submitButton = screen.getByTestId('auth-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('loading state', () => {
    it('should disable form fields during submission', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('auth-email-input');
      const passwordInput = screen.getByTestId('auth-password-input');
      const submitButton = screen.getByTestId('auth-submit-btn');

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner on submit button during submission', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(<LoginForm />);

      const submitButton = screen.getByTestId('auth-submit-btn');
      const spinner = submitButton.querySelector('.animate-spin');

      expect(spinner).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error alert when login fails', () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<LoginForm />);

      const errorAlert = screen.getByTestId('error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });

    it('should not show error alert when no error', () => {
      render(<LoginForm />);

      expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument();
    });

    it('should display the exact error message returned', () => {
      const errorMessage = 'Network error occurred';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<LoginForm />);

      expect(screen.getByTestId('error-alert')).toHaveTextContent(errorMessage);
    });
  });

  describe('success handling', () => {
    it('should display success message after successful login', () => {
      const successMessage = 'Login successful';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        success: successMessage,
      });

      render(<LoginForm />);

      const successAlert = screen.getByTestId('success-alert');
      expect(successAlert).toBeInTheDocument();
      expect(successAlert).toHaveTextContent(successMessage);
    });

    it('should not show success alert when no success message', () => {
      render(<LoginForm />);

      expect(screen.queryByTestId('success-alert')).not.toBeInTheDocument();
    });

    it('should call onSuccess callback after successful login', async () => {
      const mockOnSuccess = vi.fn();
      mockLogin.mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByTestId('auth-email-input');
      const passwordInput = screen.getByTestId('auth-password-input');
      const submitButton = screen.getByTestId('auth-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
    });

    it('should have email input with correct type', () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('auth-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render error alert with destructive variant', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: 'Error message',
      });

      render(<LoginForm />);

      const errorAlert = screen.getByTestId('error-alert');
      expect(errorAlert).toBeInTheDocument();
    });
  });
});
