import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePasswordUpdateForm } from '@/hooks/usePasswordUpdateForm';

describe('usePasswordUpdateForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      expect(result.current.form.getValues()).toEqual({
        password: '',
        confirmPassword: '',
      });
    });

    it('should provide form instance', () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      expect(result.current.form).toBeDefined();
      expect(result.current.form.register).toBeTypeOf('function');
      expect(result.current.form.handleSubmit).toBeTypeOf('function');
    });

    it('should provide handleSubmit function', () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      expect(result.current.handleSubmit).toBeTypeOf('function');
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with password', async () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.form.setValue('password', 'NewPassword123');
        result.current.form.setValue('confirmPassword', 'NewPassword123');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalledWith('NewPassword123');
    });

    it('should handle successful password update without throwing', async () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.form.setValue('password', 'SecurePass123');
        result.current.form.setValue('confirmPassword', 'SecurePass123');
      });

      // handleSubmit should not throw when called
      expect(() => {
        result.current.handleSubmit();
      }).not.toThrow();
    });

    it('should propagate errors from onSubmit', async () => {
      const error = new Error('Update failed');
      mockOnSubmit.mockRejectedValue(error);

      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.form.setValue('password', 'NewPassword123');
        result.current.form.setValue('confirmPassword', 'NewPassword123');
      });

      await expect(
        act(async () => {
          await result.current.handleSubmit();
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('form state management', () => {
    it('should allow setting all fields', () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      expect(result.current.form.getValues()).toEqual({
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });

    it('should allow form reset', () => {
      const { result } = renderHook(() => usePasswordUpdateForm({ onSubmit: mockOnSubmit }));

      act(() => {
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      act(() => {
        result.current.form.reset();
      });

      expect(result.current.form.getValues()).toEqual({
        password: '',
        confirmPassword: '',
      });
    });
  });

  describe('onSubmit callback updates', () => {
    it('should use updated onSubmit callback', async () => {
      const onSubmit1 = vi.fn().mockResolvedValue(undefined);
      const onSubmit2 = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(({ onSubmit }) => usePasswordUpdateForm({ onSubmit }), {
        initialProps: { onSubmit: onSubmit1 },
      });

      act(() => {
        result.current.form.setValue('password', 'Password123');
        result.current.form.setValue('confirmPassword', 'Password123');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit1).toHaveBeenCalled();

      // Update onSubmit
      rerender({ onSubmit: onSubmit2 });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit2).toHaveBeenCalled();
    });
  });
});
