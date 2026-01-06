import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import * as useGoogleAuthModule from '@/hooks/useGoogleAuth';

// Mock useGoogleAuth hook
vi.mock('@/hooks/useGoogleAuth');

describe('GoogleAuthButton', () => {
  const mockHandleGoogleAuth = vi.fn();

  const defaultHookReturn = {
    handleGoogleAuth: mockHandleGoogleAuth,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGoogleAuthModule.useGoogleAuth).mockReturnValue(defaultHookReturn);
  });

  describe('rendering', () => {
    it('should render button with Google icon', () => {
      render(<GoogleAuthButton />);

      const button = screen.getByTestId('google-auth-btn');
      expect(button).toBeInTheDocument();

      const icon = button.querySelector('[data-icon="google"]');
      expect(icon).toBeInTheDocument();
    });

    it('should show login text by default', () => {
      render(<GoogleAuthButton />);

      expect(screen.getByTestId('google-auth-btn')).toHaveTextContent('Zaloguj się przez Google');
    });

    it('should show login text when mode is login', () => {
      render(<GoogleAuthButton mode='login' />);

      expect(screen.getByTestId('google-auth-btn')).toHaveTextContent('Zaloguj się przez Google');
    });

    it('should show register text when mode is register', () => {
      render(<GoogleAuthButton mode='register' />);

      expect(screen.getByTestId('google-auth-btn')).toHaveTextContent('Zarejestruj się przez Google');
    });
  });

  describe('interactions', () => {
    it('should call handleGoogleAuth when clicked', async () => {
      const user = userEvent.setup();
      render(<GoogleAuthButton />);

      const button = screen.getByTestId('google-auth-btn');
      await user.click(button);

      expect(mockHandleGoogleAuth).toHaveBeenCalled();
    });

    it('should be enabled by default', () => {
      render(<GoogleAuthButton />);

      const button = screen.getByTestId('google-auth-btn');
      expect(button).not.toBeDisabled();
    });
  });

  describe('loading state', () => {
    it('should disable button during loading', () => {
      vi.mocked(useGoogleAuthModule.useGoogleAuth).mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      render(<GoogleAuthButton />);

      const button = screen.getByTestId('google-auth-btn');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner during authentication', () => {
      vi.mocked(useGoogleAuthModule.useGoogleAuth).mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      render(<GoogleAuthButton />);

      const button = screen.getByTestId('google-auth-btn');
      const spinner = button.querySelector('.animate-spin');

      expect(spinner).toBeInTheDocument();
    });

    it('should hide Google icon during loading', () => {
      vi.mocked(useGoogleAuthModule.useGoogleAuth).mockReturnValue({
        ...defaultHookReturn,
        isLoading: true,
      });

      render(<GoogleAuthButton />);

      const button = screen.getByTestId('google-auth-btn');
      const icon = button.querySelector('[data-icon="google"]');

      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error message when auth fails', () => {
      const errorMessage = 'Google authentication failed';
      vi.mocked(useGoogleAuthModule.useGoogleAuth).mockReturnValue({
        ...defaultHookReturn,
        error: errorMessage,
      });

      render(<GoogleAuthButton />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not show error message when no error', () => {
      render(<GoogleAuthButton />);

      // Check that no alert is rendered
      const alerts = screen.queryByRole('alert');
      expect(alerts).not.toBeInTheDocument();
    });
  });
});
