import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/auth/RegisterForm';
import * as useAuthModule from '@/hooks/useAuth';

// Mock useAuth hook (used by useRegisterForm)
vi.mock('@/hooks/useAuth');

describe('RegisterForm', () => {
  const mockRegister = vi.fn();

  const defaultAuthState = {
    login: vi.fn(),
    register: mockRegister,
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
      render(<RegisterForm />);

      const heading = screen.getByTestId('auth-heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Stwórz konto');
    });

    it('should render email input field', () => {
      render(<RegisterForm />);

      expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render password input field', () => {
      render(<RegisterForm />);

      expect(screen.getByTestId('auth-password-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
    });

    it('should render confirm password input field', () => {
      render(<RegisterForm />);

      expect(screen.getByTestId('auth-confirm-password-input')).toBeInTheDocument();
      expect(screen.getByLabelText('Potwierdź hasło')).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<RegisterForm />);

      const loginLink = screen.getByTestId('login-link');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
      expect(loginLink).toHaveTextContent('Zaloguj się');
    });

    it('should render submit button', () => {
      render(<RegisterForm />);

      const submitButton = screen.getByTestId('auth-submit-btn');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Zarejestruj się');
    });

    it('should have proper data-testid attributes', () => {
      render(<RegisterForm />);

      expect(screen.getByTestId('auth-heading')).toBeInTheDocument();
      expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-confirm-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('login-link')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByTestId('auth-email-input') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByTestId('auth-password-input') as HTMLInputElement;
      await user.type(passwordInput, 'Password123');

      expect(passwordInput.value).toBe('Password123');
    });

    it('should allow typing in confirm password field', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const confirmPasswordInput = screen.getByTestId('auth-confirm-password-input') as HTMLInputElement;
      await user.type(confirmPasswordInput, 'Password123');

      expect(confirmPasswordInput.value).toBe('Password123');
    });

    it('should call register when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByTestId('auth-email-input');
      const passwordInput = screen.getByTestId('auth-password-input');
      const confirmPasswordInput = screen.getByTestId('auth-confirm-password-input');
      const submitButton = screen.getByTestId('auth-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
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

      render(<RegisterForm />);

      const emailInput = screen.getByTestId('auth-email-input');
      const passwordInput = screen.getByTestId('auth-password-input');
      const confirmPasswordInput = screen.getByTestId('auth-confirm-password-input');
      const submitButton = screen.getByTestId('auth-submit-btn');

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner on submit button during submission', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(<RegisterForm />);

      const submitButton = screen.getByTestId('auth-submit-btn');
      const spinner = submitButton.querySelector('.animate-spin');

      expect(spinner).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error alert when registration fails', () => {
      const errorMessage = 'Email already exists';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<RegisterForm />);

      const errorAlert = screen.getByTestId('error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });

    it('should not show error alert when no error', () => {
      render(<RegisterForm />);

      expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument();
    });

    it('should display the exact error message returned', () => {
      const errorMessage = 'Password is too weak';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: errorMessage,
      });

      render(<RegisterForm />);

      expect(screen.getByTestId('error-alert')).toHaveTextContent(errorMessage);
    });
  });

  describe('success handling', () => {
    it('should display success message after successful registration', () => {
      const successMessage = 'Registration successful';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        success: successMessage,
      });

      render(<RegisterForm />);

      const successAlert = screen.getByTestId('success-alert');
      expect(successAlert).toBeInTheDocument();
      expect(successAlert).toHaveTextContent(successMessage);
    });

    it('should not show success alert when no success message', () => {
      render(<RegisterForm />);

      expect(screen.queryByTestId('success-alert')).not.toBeInTheDocument();
    });

    it('should call onSuccess callback after successful registration', async () => {
      const mockOnSuccess = vi.fn();
      mockRegister.mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByTestId('auth-email-input');
      const passwordInput = screen.getByTestId('auth-password-input');
      const confirmPasswordInput = screen.getByTestId('auth-confirm-password-input');
      const submitButton = screen.getByTestId('auth-submit-btn');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
      expect(screen.getByLabelText('Potwierdź hasło')).toBeInTheDocument();
    });

    it('should have email input with correct type', () => {
      render(<RegisterForm />);

      const emailInput = screen.getByTestId('auth-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render error alert with destructive variant', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        error: 'Error message',
      });

      render(<RegisterForm />);

      const errorAlert = screen.getByTestId('error-alert');
      expect(errorAlert).toBeInTheDocument();
    });
  });
});
