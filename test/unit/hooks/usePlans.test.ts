import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlans, type UsePlansParams } from '@/hooks/usePlans';
import type { PaginatedPlansDto } from '@/types';

describe('usePlans', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  const mockPlansData: PaginatedPlansDto = {
    plans: [
      {
        id: 'plan-1',
        name: 'Paris Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-03',
        status: 'generated',
        created_at: '2024-01-01',
        has_generated_content: true,
        has_fixed_points: false,
      },
      {
        id: 'plan-2',
        name: 'Rome Trip',
        destination: 'Rome',
        start_date: '2024-07-01',
        end_date: '2024-07-05',
        status: 'draft',
        created_at: '2024-01-02',
        has_generated_content: false,
        has_fixed_points: true,
      },
    ],
    meta: {
      total_count: 2,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            /* never resolves */
          })
      );

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('successful data fetching', () => {
    it('should fetch plans with basic params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?limit=10&offset=0');
      expect(result.current.data).toEqual(mockPlansData);
      expect(result.current.error).toBeNull();
    });

    it('should include single status in query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ status: 'generated', limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?statuses=generated&limit=10&offset=0');
    });

    it('should handle multiple statuses in query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ status: ['draft', 'generated'], limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?statuses=draft%2Cgenerated&limit=10&offset=0');
    });

    it('should include sortBy and order params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0, sortBy: 'name', order: 'asc' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?limit=10&offset=0&sort_by=name&order=asc');
    });

    it('should handle offset for pagination', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 20 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?limit=10&offset=20');
    });

    it('should handle all params together', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const params: UsePlansParams = {
        status: ['draft', 'generated'],
        limit: 5,
        offset: 10,
        sortBy: 'created_at',
        order: 'desc',
      };

      const { result } = renderHook(() => usePlans(params));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/plans?statuses=draft%2Cgenerated&limit=5&offset=10&sort_by=created_at&order=desc'
      );
      expect(result.current.data).toEqual(mockPlansData);
    });
  });

  describe('error handling', () => {
    it('should handle non-OK response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch plans: Internal Server Error');
      expect(result.current.data).toBeNull();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network connection failed');
      expect(result.current.data).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('An unknown error occurred while fetching plans.');
      expect(result.current.data).toBeNull();
    });

    it('should clear previous data on error', async () => {
      // First successful fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result, rerender } = renderHook((props) => usePlans(props), {
        initialProps: { limit: 10, offset: 0 } as UsePlansParams,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockPlansData);
      });

      // Second fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      rerender({ limit: 10, offset: 10 });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch plans: Not Found');
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('refetching', () => {
    it('should refetch when params change', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { rerender } = renderHook((props) => usePlans(props), {
        initialProps: { limit: 10, offset: 0 } as UsePlansParams,
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Change params
      rerender({ limit: 20, offset: 0 });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/plans?limit=20&offset=0');
    });

    it('should refetch when status changes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { rerender } = renderHook((props) => usePlans(props), {
        initialProps: { status: 'draft', limit: 10, offset: 0 } as UsePlansParams,
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Change status
      rerender({ status: 'generated', limit: 10, offset: 0 });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/plans?statuses=generated&limit=10&offset=0');
    });

    it('should provide manual refetch function', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Manual refetch
      result.current.refetch();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset isLoading on manual refetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger manual refetch
      result.current.refetch();

      // Should briefly set isLoading to true
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should clear previous error on refetch', async () => {
      // First fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Second fetch succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlansData,
      });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.data).toEqual(mockPlansData);
    });
  });

  describe('edge cases', () => {
    it('should handle empty plans array', async () => {
      const emptyData: PaginatedPlansDto = {
        plans: [],
        meta: {
          total_count: 0,
          has_more: false,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => emptyData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(emptyData);
      expect(result.current.data?.plans).toHaveLength(0);
    });

    it('should handle limit of 0', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 0, offset: 0 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?limit=0&offset=0');
    });

    it('should handle sortBy without order', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0, sortBy: 'name' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?limit=10&offset=0&sort_by=name');
    });

    it('should handle order without sortBy', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlansData,
      });

      const { result } = renderHook(() => usePlans({ limit: 10, offset: 0, order: 'desc' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans?limit=10&offset=0&order=desc');
    });
  });
});
