import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanActionsMenu } from '@/hooks/usePlanActionsMenu';

describe('usePlanActionsMenu', () => {
  let onArchive: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;
  let originalLocation: Location;

  beforeEach(() => {
    onArchive = vi.fn().mockResolvedValue(undefined);
    onDelete = vi.fn().mockResolvedValue(undefined);

    // Mock window.location.href
    originalLocation = window.location;
    delete (window as unknown as { location: unknown }).location;
    window.location = { href: '' } as unknown as Location;

    vi.clearAllMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('initialization', () => {
    it('should initialize with all dialogs closed', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      expect(result.current.dialogs.delete).toBe(false);
      expect(result.current.dialogs.archive).toBe(false);
    });

    it('should initialize with no loading states', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      expect(result.current.loading.delete).toBe(false);
      expect(result.current.loading.archive).toBe(false);
    });
  });

  describe('dialog management', () => {
    it('should open delete dialog', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('delete');
      });

      expect(result.current.dialogs.delete).toBe(true);
      expect(result.current.dialogs.archive).toBe(false);
    });

    it('should open archive dialog', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('archive');
      });

      expect(result.current.dialogs.archive).toBe(true);
      expect(result.current.dialogs.delete).toBe(false);
    });

    it('should close delete dialog', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('delete');
      });

      expect(result.current.dialogs.delete).toBe(true);

      act(() => {
        result.current.closeDialog('delete');
      });

      expect(result.current.dialogs.delete).toBe(false);
    });

    it('should close archive dialog', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('archive');
      });

      expect(result.current.dialogs.archive).toBe(true);

      act(() => {
        result.current.closeDialog('archive');
      });

      expect(result.current.dialogs.archive).toBe(false);
    });

    it('should manage multiple dialogs independently', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('delete');
        result.current.openDialog('archive');
      });

      expect(result.current.dialogs.delete).toBe(true);
      expect(result.current.dialogs.archive).toBe(true);

      act(() => {
        result.current.closeDialog('delete');
      });

      expect(result.current.dialogs.delete).toBe(false);
      expect(result.current.dialogs.archive).toBe(true);
    });
  });

  describe('handleDelete', () => {
    it('should call onDelete', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(onDelete).toHaveBeenCalled();
    });

    it('should redirect to /plans after successful delete', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(window.location.href).toBe('/plans');
    });

    it('should set loading state during delete', async () => {
      let resolveDelete: () => void = () => {
        /* placeholder */
      };
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      onDelete.mockReturnValue(deletePromise);

      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.handleDelete();
      });

      // Should be loading
      expect(result.current.loading.delete).toBe(true);

      // Resolve the delete
      await act(async () => {
        resolveDelete();
        await deletePromise;
      });
    });

    it('should handle delete errors', async () => {
      onDelete.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      // Open dialog first
      act(() => {
        result.current.openDialog('delete');
      });

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(onDelete).toHaveBeenCalled();
      expect(result.current.loading.delete).toBe(false);
      expect(result.current.dialogs.delete).toBe(false); // Dialog closed on error
      expect(window.location.href).toBe(''); // No redirect on error
    });

    it('should not redirect on delete error', async () => {
      onDelete.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(window.location.href).toBe('');
    });
  });

  describe('handleArchive', () => {
    it('should call onArchive', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(onArchive).toHaveBeenCalled();
    });

    it('should close archive dialog after successful archive', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('archive');
      });

      expect(result.current.dialogs.archive).toBe(true);

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(result.current.dialogs.archive).toBe(false);
    });

    it('should reset loading state after archive', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(result.current.loading.archive).toBe(false);
    });

    it('should handle archive errors gracefully', async () => {
      onArchive.mockRejectedValueOnce(new Error('Archive failed'));

      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('archive');
      });

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(onArchive).toHaveBeenCalled();
      expect(result.current.loading.archive).toBe(false);
      expect(result.current.dialogs.archive).toBe(true); // Dialog stays open on error
    });

    it('should always reset loading state even on error', async () => {
      onArchive.mockRejectedValueOnce(new Error('Archive failed'));

      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(result.current.loading.archive).toBe(false);
    });
  });

  describe('loading states', () => {
    it('should manage delete loading independently', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(result.current.loading.archive).toBe(false);
    });

    it('should manage archive loading independently', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(result.current.loading.delete).toBe(false);
    });
  });

  describe('concurrent operations', () => {
    it('should handle opening both dialogs simultaneously', () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('delete');
        result.current.openDialog('archive');
      });

      expect(result.current.dialogs.delete).toBe(true);
      expect(result.current.dialogs.archive).toBe(true);
    });

    it('should not interfere between delete and archive actions', async () => {
      const { result } = renderHook(() => usePlanActionsMenu({ onArchive, onDelete }));

      act(() => {
        result.current.openDialog('delete');
        result.current.openDialog('archive');
      });

      await act(async () => {
        await result.current.handleArchive();
      });

      // Archive dialog closed, delete dialog still open
      expect(result.current.dialogs.archive).toBe(false);
      expect(result.current.dialogs.delete).toBe(true);
    });
  });
});
