import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { useAuth } from '@/hooks/useAuth';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useRegisterForm', () => {
  let mockRegister: ReturnType<typeof vi.fn>;
  let mockUseAuth: ReturnType<typeof useAuth>;

  beforeEach(() => {
    mockRegister = vi.fn().mockResolvedValue(undefined);
    mockUseAuth = {
      register: mockRegister,
      login: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      isLoading: false,
      error: null,
      success: null,
      clearError: vi.fn(),
      clearSuccess: vi.fn(),
    } as ReturnType<typeof useAuth>;
    vi.mocked(useAuth).mockReturnValue(mockUseAuth);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.form.getValues()).toEqual({
        email: '',
        password: '',
        confirmPassword: '',
      });
    });

    it('should provide form instance', () => {
      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.form).toBeDefined();
      expect(result.current.form.register).toBeTypeOf('function');
      expect(result.current.form.handleSubmit).toBeTypeOf('function');
    });

    it('should expose useAuth state', () => {
      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });
  });

  describe('form submission', () => {
    it('should call register with form data', async () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.form.setValue('email', 'newuser@example.com');
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockRegister).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });

    it('should call onSuccess callback after successful registration', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useRegisterForm({ onSuccess }));

      act(() => {
        result.current.form.setValue('email', 'newuser@example.com');
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should not call onSuccess if registration fails', async () => {
      mockRegister.mockRejectedValue(new Error('Registration failed'));
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useRegisterForm({ onSuccess }));

      act(() => {
        result.current.form.setValue('email', 'newuser@example.com');
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
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
    it('should allow setting all form fields', () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      expect(result.current.form.getValues()).toEqual({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });

    it('should allow form reset', () => {
      const { result } = renderHook(() => useRegisterForm());

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      act(() => {
        result.current.form.reset();
      });

      expect(result.current.form.getValues()).toEqual({
        email: '',
        password: '',
        confirmPassword: '',
      });
    });
  });

  describe('state propagation from useAuth', () => {
    it('should expose loading state', () => {
      mockUseAuth.isLoading = true;
      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.isLoading).toBe(true);
    });

    it('should expose error state', () => {
      mockUseAuth.error = 'Email already exists';
      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.error).toBe('Email already exists');
    });

    it('should expose success state', () => {
      mockUseAuth.success = 'Account created successfully';
      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const { result } = renderHook(() => useRegisterForm());

      expect(result.current.success).toBe('Account created successfully');
    });
  });
});
