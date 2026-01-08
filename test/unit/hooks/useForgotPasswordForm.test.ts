import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForgotPasswordForm } from '@/hooks/useForgotPasswordForm';
import { useAuth } from '@/hooks/useAuth';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useForgotPasswordForm', () => {
  let mockResetPassword: ReturnType<typeof vi.fn<(email: string) => Promise<void>>>;

  beforeEach(() => {
    mockResetPassword = vi.fn<(email: string) => Promise<void>>().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({
      resetPassword: mockResetPassword,
      login: vi.fn(),
      register: vi.fn(),
      updatePassword: vi.fn(),
      isLoading: false,
      error: null,
      success: null,
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
    });
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current.form.getValues()).toEqual({
        email: '',
      });
      expect(result.current.success).toBe(false);
    });

    it('should provide form instance', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current.form).toBeDefined();
      expect(result.current.form.register).toBeTypeOf('function');
      expect(result.current.form.handleSubmit).toBeTypeOf('function');
    });

    it('should provide resetSuccess function', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current.resetSuccess).toBeTypeOf('function');
    });

    it('should expose useAuth state', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('form submission', () => {
    it('should call resetPassword with email', async () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should set success to true after successful submission', async () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.success).toBe(true);
    });

    it('should reset form after successful submission', async () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.form.getValues().email).toBe('');
    });

    it('should not set success if resetPassword fails', async () => {
      mockResetPassword.mockRejectedValue(new Error('Reset failed'));

      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      await act(async () => {
        try {
          await result.current.onSubmit();
        } catch {
          // Expected error
        }
      });

      expect(result.current.success).toBe(false);
    });
  });

  describe('resetSuccess', () => {
    it('should reset success state to false', async () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.success).toBe(true);

      act(() => {
        result.current.resetSuccess();
      });

      expect(result.current.success).toBe(false);
    });

    it('should allow resubmission after resetSuccess', async () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      // First submission
      act(() => {
        result.current.form.setValue('email', 'test1@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.success).toBe(true);

      // Reset success
      act(() => {
        result.current.resetSuccess();
      });

      expect(result.current.success).toBe(false);

      // Second submission
      act(() => {
        result.current.form.setValue('email', 'test2@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockResetPassword).toHaveBeenCalledTimes(2);
    });
  });

  describe('form state management', () => {
    it('should allow setting email value', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      expect(result.current.form.getValues().email).toBe('test@example.com');
    });

    it('should allow form reset', () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
      });

      act(() => {
        result.current.form.reset();
      });

      expect(result.current.form.getValues().email).toBe('');
    });
  });
});
