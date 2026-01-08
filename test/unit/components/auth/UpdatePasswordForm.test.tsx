import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import * as useAuthModule from '@/hooks/useAuth';
import * as usePasswordRecoverySessionModule from '@/hooks/usePasswordRecoverySession';

// Mock hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/usePasswordRecoverySession');

// Types for mock components
type PasswordUpdateFormProps = {
  onSubmit: (password: string) => void;
  isLoading: boolean;
  error: string | null;
};

// Mock child components
vi.mock('@/components/auth/password-update', () => ({
  SessionVerifying: () => <div data-testid='session-verifying'>Verifying session...</div>,
  InvalidSession: () => <div data-testid='invalid-session'>Invalid session</div>,
  PasswordUpdateSuccess: () => <div data-testid='password-update-success'>Success!</div>,
  PasswordUpdateForm: ({ onSubmit, isLoading, error }: PasswordUpdateFormProps) => (
    <div data-testid='password-update-form'>
      <input data-testid='password-input' type='password' onChange={(e) => e.target.value} />
      <button data-testid='submit-button' onClick={() => onSubmit('newPassword123')} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
      {error && <div data-testid='form-error'>{error}</div>}
    </div>
  ),
}));

describe('UpdatePasswordForm', () => {
  const mockUpdatePassword = vi.fn();

  const mockUseAuth: ReturnType<typeof useAuthModule.useAuth> = {
    updatePassword: mockUpdatePassword,
    isLoading: false,
    error: null,
    success: null,
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
    clearError: vi.fn(),
    clearSuccess: vi.fn(),
  };

  const mockUsePasswordRecoverySession: ReturnType<typeof usePasswordRecoverySessionModule.usePasswordRecoverySession> =
    {
      status: 'valid',
      isVerifying: false,
      isValid: true,
      isInvalid: false,
    };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(mockUseAuth);
    vi.mocked(usePasswordRecoverySessionModule.usePasswordRecoverySession).mockReturnValue(
      mockUsePasswordRecoverySession
    );
  });

  describe('rendering states', () => {
    it('should show verifying state when isVerifying is true', () => {
      vi.mocked(usePasswordRecoverySessionModule.usePasswordRecoverySession).mockReturnValue({
        status: 'verifying',
        isVerifying: true,
        isValid: false,
        isInvalid: false,
      });

      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('session-verifying')).toBeInTheDocument();
      expect(screen.queryByTestId('password-update-form')).not.toBeInTheDocument();
    });

    it('should show invalid session state when isInvalid is true', () => {
      vi.mocked(usePasswordRecoverySessionModule.usePasswordRecoverySession).mockReturnValue({
        status: 'invalid',
        isVerifying: false,
        isValid: false,
        isInvalid: true,
      });

      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('invalid-session')).toBeInTheDocument();
      expect(screen.queryByTestId('password-update-form')).not.toBeInTheDocument();
    });

    it('should show password form when session is valid', () => {
      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('password-update-form')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should show success state after successful password update', async () => {
      const user = userEvent.setup();
      mockUpdatePassword.mockResolvedValue(undefined);

      render(<UpdatePasswordForm />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('password-update-success')).toBeInTheDocument();
      });
    });
  });

  describe('password update flow', () => {
    it('should call updatePassword with correct password on submit', async () => {
      const user = userEvent.setup();
      mockUpdatePassword.mockResolvedValue(undefined);

      render(<UpdatePasswordForm />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockUpdatePassword).toHaveBeenCalledWith('newPassword123');
    });

    it('should show loading state while submitting', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...mockUseAuth,
        isLoading: true,
      });

      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Submitting...');
    });

    it('should display error message when update fails', () => {
      const errorMessage = 'Password must be at least 8 characters';
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...mockUseAuth,
        error: errorMessage,
      });

      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('form-error')).toHaveTextContent(errorMessage);
    });

    it('should handle update failure without changing state', async () => {
      const user = userEvent.setup();
      mockUpdatePassword.mockRejectedValue(new Error('Update failed'));

      render(<UpdatePasswordForm />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalled();
      });

      // Should still show the form (not success screen)
      expect(screen.getByTestId('password-update-form')).toBeInTheDocument();
      expect(screen.queryByTestId('password-update-success')).not.toBeInTheDocument();
    });
  });

  describe('state priority (happy path last)', () => {
    it('should prioritize verifying state over all others', () => {
      vi.mocked(usePasswordRecoverySessionModule.usePasswordRecoverySession).mockReturnValue({
        status: 'verifying',
        isVerifying: true,
        isValid: false,
        isInvalid: true, // Even with invalid, verifying takes priority
      });

      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('session-verifying')).toBeInTheDocument();
      expect(screen.queryByTestId('invalid-session')).not.toBeInTheDocument();
    });

    it('should prioritize invalid state over form when not verifying', () => {
      vi.mocked(usePasswordRecoverySessionModule.usePasswordRecoverySession).mockReturnValue({
        status: 'invalid',
        isVerifying: false,
        isValid: false,
        isInvalid: true,
      });

      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('invalid-session')).toBeInTheDocument();
      expect(screen.queryByTestId('password-update-form')).not.toBeInTheDocument();
    });

    it('should show form as last option (happy path)', () => {
      render(<UpdatePasswordForm />);

      expect(screen.getByTestId('password-update-form')).toBeInTheDocument();
      expect(screen.queryByTestId('session-verifying')).not.toBeInTheDocument();
      expect(screen.queryByTestId('invalid-session')).not.toBeInTheDocument();
    });
  });

  describe('integration with hooks', () => {
    it('should correctly use usePasswordRecoverySession hook', () => {
      render(<UpdatePasswordForm />);

      expect(usePasswordRecoverySessionModule.usePasswordRecoverySession).toHaveBeenCalled();
    });

    it('should correctly use useAuth hook', () => {
      render(<UpdatePasswordForm />);

      expect(useAuthModule.useAuth).toHaveBeenCalled();
    });

    it('should handle multiple failed attempts', async () => {
      const user = userEvent.setup();
      let attemptCount = 0;

      mockUpdatePassword.mockImplementation(() => {
        attemptCount++;
        return Promise.reject(new Error(`Attempt ${attemptCount} failed`));
      });

      render(<UpdatePasswordForm />);

      const submitButton = screen.getByTestId('submit-button');

      // First attempt
      await user.click(submitButton);
      await waitFor(() => expect(attemptCount).toBe(1));

      // Still shows form for retry
      expect(screen.getByTestId('password-update-form')).toBeInTheDocument();

      // Second attempt
      await user.click(submitButton);
      await waitFor(() => expect(attemptCount).toBe(2));

      expect(screen.getByTestId('password-update-form')).toBeInTheDocument();
    });
  });
});
