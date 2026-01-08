import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanCard } from '@/hooks/usePlanCard';
import { formatDateTime } from '@/lib/utils/dateFormatters';
import { getPlanStatusConfig } from '@/lib/constants/planStatus';
import type { PlanStatus } from '@/types';

// Mock dependencies
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatDateTime: vi.fn((date: string) => `Formatted: ${date}`),
}));

vi.mock('@/lib/constants/planStatus', () => ({
  getPlanStatusConfig: vi.fn((status: string) => ({
    label: `${status} label`,
    variant: 'default' as const,
  })),
}));

describe('usePlanCard', () => {
  let onDelete: ReturnType<typeof vi.fn<(planId: string) => void>>;
  let onClick: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onDelete = vi.fn<(planId: string) => void>();
    onClick = vi.fn<() => void>();
    vi.clearAllMocks();
  });

  /**
   * Helper to create a mock MouseEvent
   */
  const createMouseEvent = (): React.MouseEvent<HTMLElement> =>
    ({
      stopPropagation: vi.fn(),
    }) as unknown as React.MouseEvent<HTMLElement>;

  /**
   * Helper to create a mock KeyboardEvent
   */
  const createKeyboardEvent = (key: string): React.KeyboardEvent<HTMLElement> =>
    ({
      key,
      preventDefault: vi.fn(),
    }) as unknown as React.KeyboardEvent<HTMLElement>;

  describe('initialization', () => {
    it('should initialize with status config', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      expect(result.current.statusConfig).toEqual({
        label: 'draft label',
        variant: 'default',
      });
      expect(getPlanStatusConfig).toHaveBeenCalledWith('draft');
    });

    it('should provide all handler functions', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      expect(result.current.formatCardDateTime).toBeInstanceOf(Function);
      expect(result.current.handleDelete).toBeInstanceOf(Function);
      expect(result.current.handleKeyDown).toBeInstanceOf(Function);
    });
  });

  describe('statusConfig', () => {
    it('should get config for draft status', () => {
      renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      expect(getPlanStatusConfig).toHaveBeenCalledWith('draft');
    });

    it('should get config for generated status', () => {
      renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'generated' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      expect(getPlanStatusConfig).toHaveBeenCalledWith('generated');
    });

    it('should get config for archived status', () => {
      renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'archived' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      expect(getPlanStatusConfig).toHaveBeenCalledWith('archived');
    });
  });

  describe('formatCardDateTime', () => {
    it('should format date with correct options', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const formatted = result.current.formatCardDateTime('2024-06-01');

      expect(formatDateTime).toHaveBeenCalledWith('2024-06-01', {
        dateStyle: 'short',
        includeYear: true,
      });
      expect(formatted).toBe('Formatted: 2024-06-01');
    });

    it('should be memoized', () => {
      const { result, rerender } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const firstFormatter = result.current.formatCardDateTime;

      rerender();

      const secondFormatter = result.current.formatCardDateTime;

      expect(firstFormatter).toBe(secondFormatter);
    });
  });

  describe('handleDelete', () => {
    it('should call onDelete with planId', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-123',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createMouseEvent();

      act(() => {
        result.current.handleDelete(mockEvent);
      });

      expect(onDelete).toHaveBeenCalledWith('plan-123');
    });

    it('should stop event propagation', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createMouseEvent();

      act(() => {
        result.current.handleDelete(mockEvent);
      });

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should not call onClick when deleting', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createMouseEvent();

      act(() => {
        result.current.handleDelete(mockEvent);
      });

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('handleKeyDown', () => {
    it('should call onClick on Enter key', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createKeyboardEvent('Enter');

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalled();
    });

    it('should call onClick on Space key', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createKeyboardEvent(' ');

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick on other keys', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createKeyboardEvent('Escape');

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick on Tab key', () => {
      const { result } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const mockEvent = createKeyboardEvent('Tab');

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('callback stability', () => {
    it('should keep handleDelete stable when deps do not change', () => {
      const { result, rerender } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const firstHandler = result.current.handleDelete;

      rerender();

      const secondHandler = result.current.handleDelete;

      expect(firstHandler).toBe(secondHandler);
    });

    it('should update handleDelete when planId changes', () => {
      const { result, rerender } = renderHook(
        ({ planId }) =>
          usePlanCard({
            planId,
            status: 'draft' as PlanStatus,
            onDelete,
            onClick,
          }),
        {
          initialProps: { planId: 'plan-1' },
        }
      );

      const firstHandler = result.current.handleDelete;

      rerender({ planId: 'plan-2' });

      const secondHandler = result.current.handleDelete;

      expect(firstHandler).not.toBe(secondHandler);
    });

    it('should keep handleKeyDown stable when deps do not change', () => {
      const { result, rerender } = renderHook(() =>
        usePlanCard({
          planId: 'plan-1',
          status: 'draft' as PlanStatus,
          onDelete,
          onClick,
        })
      );

      const firstHandler = result.current.handleKeyDown;

      rerender();

      const secondHandler = result.current.handleKeyDown;

      expect(firstHandler).toBe(secondHandler);
    });
  });
});
