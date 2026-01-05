import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/lib/services/auth.client.service';
import { getAuthErrorMessage } from '@/lib/constants/authErrors';
import type { LoginFormData, RegisterFormData } from '@/lib/schemas/auth.schema';

// Mock AuthService
vi.mock('@/lib/services/auth.client.service', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

// Mock getAuthErrorMessage
vi.mock('@/lib/constants/authErrors', () => ({
  getAuthErrorMessage: vi.fn((msg) => msg),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.replace to prevent actual navigation
    Object.defineProperty(window, 'location', {
      value: { replace: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it('should provide all auth methods', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.login).toBeTypeOf('function');
      expect(result.current.register).toBeTypeOf('function');
      expect(result.current.resetPassword).toBeTypeOf('function');
      expect(result.current.updatePassword).toBeTypeOf('function');
      expect(result.current.clearError).toBeTypeOf('function');
      expect(result.current.clearSuccess).toBeTypeOf('function');
    });
  });

  describe('login', () => {
    it('should call AuthService.login with credentials', async () => {
      vi.mocked(AuthService.login).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());
      const credentials: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(AuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(AuthService.login).mockRejectedValue(error);
      vi.mocked(getAuthErrorMessage).mockReturnValue('Nieprawidłowe dane logowania');

      const { result } = renderHook(() => useAuth());
      const credentials: LoginFormData = {
        email: 'test@example.com',
        password: 'wrong',
      };

      await expect(
        act(async () => {
          await result.current.login(credentials);
        })
      ).rejects.toThrow();

      expect(getAuthErrorMessage).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should call AuthService.register with credentials', async () => {
      vi.mocked(AuthService.register).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());
      const credentials: RegisterFormData = {
        email: 'new@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      await act(async () => {
        await result.current.register(credentials);
      });

      expect(AuthService.register).toHaveBeenCalledWith(credentials);
    });

    it('should handle registration error', async () => {
      const error = new Error('Email already exists');
      vi.mocked(AuthService.register).mockRejectedValue(error);
      vi.mocked(getAuthErrorMessage).mockReturnValue('Ten adres email jest już używany');

      const { result } = renderHook(() => useAuth());
      const credentials: RegisterFormData = {
        email: 'existing@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      await expect(
        act(async () => {
          await result.current.register(credentials);
        })
      ).rejects.toThrow();

      expect(getAuthErrorMessage).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should call AuthService.resetPassword with email', async () => {
      vi.mocked(AuthService.resetPassword).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());
      const email = 'test@example.com';

      await act(async () => {
        await result.current.resetPassword(email);
      });

      expect(AuthService.resetPassword).toHaveBeenCalledWith(email);
    });

    it('should handle reset password error', async () => {
      const error = new Error('User not found');
      vi.mocked(AuthService.resetPassword).mockRejectedValue(error);
      vi.mocked(getAuthErrorMessage).mockReturnValue('Nie znaleziono użytkownika');

      const { result } = renderHook(() => useAuth());
      const email = 'nonexistent@example.com';

      await expect(
        act(async () => {
          await result.current.resetPassword(email);
        })
      ).rejects.toThrow();

      expect(getAuthErrorMessage).toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should call AuthService.updatePassword with new password', async () => {
      vi.mocked(AuthService.updatePassword).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());
      const newPassword = 'NewPassword123';

      await act(async () => {
        await result.current.updatePassword(newPassword);
      });

      expect(AuthService.updatePassword).toHaveBeenCalledWith(newPassword);
    });

    it('should handle update password error', async () => {
      const error = new Error('Password update failed');
      vi.mocked(AuthService.updatePassword).mockRejectedValue(error);
      vi.mocked(getAuthErrorMessage).mockReturnValue('Nie udało się zaktualizować hasła');

      const { result } = renderHook(() => useAuth());
      const newPassword = 'NewPassword123';

      await expect(
        act(async () => {
          await result.current.updatePassword(newPassword);
        })
      ).rejects.toThrow();

      expect(getAuthErrorMessage).toHaveBeenCalled();
    });
  });

  describe('clearError and clearSuccess', () => {
    it('should provide clearError function', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.clearError).toBeTypeOf('function');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should provide clearSuccess function', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.clearSuccess).toBeTypeOf('function');

      act(() => {
        result.current.clearSuccess();
      });

      expect(result.current.success).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should call getAuthErrorMessage on error', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Test error'));
      vi.mocked(getAuthErrorMessage).mockReturnValue('Wystąpił błąd');

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login({ email: 'test@test.com', password: 'test' });
        })
      ).rejects.toThrow();

      expect(getAuthErrorMessage).toHaveBeenCalled();
    });

    it('should throw error after handling it', async () => {
      const error = new Error('Test error');
      vi.mocked(AuthService.login).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login({ email: 'test@test.com', password: 'test' });
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('multiple operations', () => {
    it('should handle consecutive operations', async () => {
      vi.mocked(AuthService.resetPassword).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword('test1@example.com');
      });

      await act(async () => {
        await result.current.resetPassword('test2@example.com');
      });

      expect(AuthService.resetPassword).toHaveBeenCalledTimes(2);
      expect(AuthService.resetPassword).toHaveBeenNthCalledWith(1, 'test1@example.com');
      expect(AuthService.resetPassword).toHaveBeenNthCalledWith(2, 'test2@example.com');
    });
  });
});
