import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import type { PlanDetailsDto, TimelineItem } from '@/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('usePlanDetails', () => {
  const mockPlan: PlanDetailsDto = {
    id: 'plan-1',
    name: 'Test Plan',
    status: 'draft',
    created_at: '2024-01-01',
    notes: 'Test notes',
    timeline: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization and fetching', () => {
    it('should initialize with loading state', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlan),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        // Wait for effect to complete to avoid act warning
        expect(result.current.isLoading).toBeDefined();
      });
    });

    it('should fetch plan details on mount', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlan),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.plan).toEqual(mockPlan);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/plans/plan-1');
    });

    it('should handle 404 error for non-existent plan', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('non-existent'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Plan not found');
      expect(result.current.plan).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Network error');
      expect(result.current.plan).toBeNull();
    });
  });

  describe('plan mutations', () => {
    it('should provide updatePlanName method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...mockPlan, name: 'Updated Plan' }),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.updatePlanName).toBeTypeOf('function');

      await act(async () => {
        await result.current.updatePlanName('Updated Plan');
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should provide archivePlan method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...mockPlan, status: 'archived' }),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.archivePlan).toBeTypeOf('function');

      await act(async () => {
        await result.current.archivePlan();
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should provide deletePlan method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.deletePlan).toBeTypeOf('function');

      await act(async () => {
        await result.current.deletePlan();
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should provide addActivity method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.addActivity).toBeTypeOf('function');

      const activity: Partial<TimelineItem> = {
        title: 'New Activity',
        category: 'culture',
      };

      await act(async () => {
        await result.current.addActivity('2024-01-15', activity);
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should provide updateActivity method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.updateActivity).toBeTypeOf('function');

      const activity: Partial<TimelineItem> = {
        title: 'Updated Activity',
      };

      await act(async () => {
        await result.current.updateActivity('2024-01-15', 'item-1', activity);
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should provide deleteActivity method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.deleteActivity).toBeTypeOf('function');

      await act(async () => {
        await result.current.deleteActivity('2024-01-15', 'item-1');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should provide generatePlan method', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPlan),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.generatePlan).toBeTypeOf('function');

      await act(async () => {
        await result.current.generatePlan();
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlan),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => usePlanDetails('plan-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.refetch).toBeTypeOf('function');

      const initialCallCount = mockFetch.mock.calls.length;

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('planId changes', () => {
    it('should refetch when planId changes', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlan),
      });
      global.fetch = mockFetch;

      const { rerender } = renderHook(({ id }) => usePlanDetails(id), { initialProps: { id: 'plan-1' } });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const initialCallCount = mockFetch.mock.calls.length;

      rerender({ id: 'plan-2' });

      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });
});
