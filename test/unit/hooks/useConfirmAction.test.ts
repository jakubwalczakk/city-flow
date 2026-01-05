import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConfirmAction } from '@/hooks/useConfirmAction';

describe('useConfirmAction', () => {
  let mockAction: ReturnType<typeof vi.fn>;
  let mockOnSuccess: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAction = vi.fn().mockResolvedValue(undefined);
    mockOnSuccess = vi.fn();
    mockOnError = vi.fn();
  });

  describe('initialization', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isPending).toBe(false);
    });

    it('should initialize without callbacks', () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      expect(result.current).toHaveProperty('open');
      expect(result.current).toHaveProperty('close');
      expect(result.current).toHaveProperty('execute');
    });
  });

  describe('opening and closing', () => {
    it('should open dialog when open is called', () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close dialog when close is called', () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should allow setting isOpen directly', () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('executing action', () => {
    it('should execute action and call onSuccess', async () => {
      const { result } = renderHook(() =>
        useConfirmAction(mockAction, {
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.open();
      });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should close dialog after successful execution', async () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      act(() => {
        result.current.open();
      });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.isOpen).toBe(false);
      });
    });

    it('should call onError when action fails', async () => {
      const error = new Error('Action failed');
      mockAction.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useConfirmAction(mockAction, {
          onError: mockOnError,
        })
      );

      act(() => {
        result.current.open();
      });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(error);
      });
    });

    it('should not call onSuccess when action fails', async () => {
      mockAction.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() =>
        useConfirmAction(mockAction, {
          onSuccess: mockOnSuccess,
          onError: mockOnError,
        })
      );

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should set isPending during execution', async () => {
      let resolveAction: () => void;
      const actionPromise = new Promise<void>((resolve) => {
        resolveAction = resolve;
      });
      mockAction.mockReturnValue(actionPromise);

      const { result } = renderHook(() => useConfirmAction(mockAction));

      await act(async () => {
        result.current.execute();
      });

      // Should be pending
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Resolve the action - wrap resolution in act to handle state updates
      await act(async () => {
        if (resolveAction) {
          resolveAction();
        }
      });

      // Should not be pending anymore
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should handle execution without callbacks', async () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      });
    });

    it('should execute action multiple times', async () => {
      const { result } = renderHook(() => useConfirmAction(mockAction));

      await act(async () => {
        result.current.execute();
      });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('action updates', () => {
    it('should use updated action function', async () => {
      const action1 = vi.fn().mockResolvedValue(undefined);
      const action2 = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(({ action }) => useConfirmAction(action), {
        initialProps: { action: action1 },
      });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(action1).toHaveBeenCalled();
      });

      rerender({ action: action2 });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(action2).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle synchronous action', async () => {
      const syncAction = vi.fn(() => Promise.resolve());

      const { result } = renderHook(() => useConfirmAction(syncAction));

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(syncAction).toHaveBeenCalled();
      });
    });

    it('should not close dialog if action fails', async () => {
      mockAction.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() =>
        useConfirmAction(mockAction, {
          onError: mockOnError,
        })
      );

      act(() => {
        result.current.open();
      });

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });

      // Dialog should still be open after error
      expect(result.current.isOpen).toBe(true);
    });
  });
});
