import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useAuth } from '@/hooks/useAuth';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useLoginForm', () => {
  let mockLogin: ReturnType<typeof vi.fn>;
  let mockUseAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLogin = vi.fn().mockResolvedValue(undefined);
    mockUseAuth = {
      login: mockLogin,
      isLoading: false,
      error: null,
      success: null,
    };
    vi.mocked(useAuth).mockReturnValue(mockUseAuth);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useLoginForm());

      expect(result.current.form.getValues()).toEqual({
        email: '',
        password: '',
      });
    });

    it('should provide form instance with required methods', () => {
      const { result } = renderHook(() => useLoginForm());

      expect(result.current.form).toBeDefined();
      expect(result.current.form.register).toBeTypeOf('function');
      expect(result.current.form.handleSubmit).toBeTypeOf('function');
    });

    it('should expose useAuth state', () => {
      const { result } = renderHook(() => useLoginForm());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it('should call onSuccess callback when provided', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useLoginForm({ onSuccess }));

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('should call login with form data', async () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.form.setValue('email', 'user@example.com');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('should handle login without onSuccess callback', async () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockLogin).toHaveBeenCalled();
    });

    it('should not call onSuccess if login fails', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'));
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useLoginForm({ onSuccess }));

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'wrong');
      });

      await act(async () => {
        try {
          await result.current.onSubmit();
        } catch {
          // Expected error
        }
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('form state management', () => {
    it('should allow setting form values', () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password123');
      });

      expect(result.current.form.getValues()).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should allow form reset', () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password123');
      });

      act(() => {
        result.current.form.reset();
      });

      expect(result.current.form.getValues()).toEqual({
        email: '',
        password: '',
      });
    });
  });

  describe('state propagation from useAuth', () => {
    it('should expose loading state', () => {
      mockUseAuth.isLoading = true;
      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.isLoading).toBe(true);
    });

    it('should expose error state', () => {
      mockUseAuth.error = 'Login failed';
      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.error).toBe('Login failed');
    });

    it('should expose success state', () => {
      mockUseAuth.success = 'Logged in successfully';
      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.success).toBe('Logged in successfully');
    });
  });
});
