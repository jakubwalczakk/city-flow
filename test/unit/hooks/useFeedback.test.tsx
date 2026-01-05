import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import type { FeedbackDto } from '@/types';

// Helper to create wrapper with React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useFeedback', () => {
  const mockFeedback: FeedbackDto = {
    rating: 'thumbs_up',
    comment: 'Great plan!',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('initialization', () => {
    it('should initialize with null rating when no saved feedback', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.selectedRating).toBeNull();
      expect(result.current.comment).toBe('');
    });

    it('should load saved feedback', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.selectedRating).toBe('thumbs_up');
      expect(result.current.comment).toBe('Great plan!');
    });
  });

  describe('rating selection', () => {
    it('should update selectedRating when user selects rating', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateRating('thumbs_up');
      });

      expect(result.current.selectedRating).toBe('thumbs_up');
    });

    it('should allow changing rating', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.updateRating('thumbs_up');
      });
      expect(result.current.selectedRating).toBe('thumbs_up');

      act(() => {
        result.current.updateRating('thumbs_down');
      });
      expect(result.current.selectedRating).toBe('thumbs_down');
    });
  });

  describe('comment editing', () => {
    it('should update comment', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.updateComment('New comment');
      });

      expect(result.current.comment).toBe('New comment');
    });
  });

  describe('hasChanges detection', () => {
    it('should return false when no changes made', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it('should return true when rating changed', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.updateRating('thumbs_down');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should return true when comment changed', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.updateComment('Updated comment');
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('feedback submission', () => {
    it('should call API when submitting feedback', async () => {
      const fetchMock = vi.mocked(global.fetch);

      // Initial load
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Submit feedback
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      } as Response);

      act(() => {
        result.current.updateRating('thumbs_up');
        result.current.updateComment('Great!');
      });

      await act(async () => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/plans/plan-1/feedback',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            rating: 'thumbs_up',
            comment: 'Great!',
          }),
        })
      );
    });

    it('should not submit if rating is null', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const callCount = vi.mocked(global.fetch).mock.calls.length;

      act(() => {
        result.current.handleSubmit();
      });

      // Should not make additional fetch call
      expect(vi.mocked(global.fetch).mock.calls.length).toBe(callCount);
    });

    it('should show success message after submission', async () => {
      const fetchMock = vi.mocked(global.fetch);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFeedback),
      } as Response);

      act(() => {
        result.current.updateRating('thumbs_up');
      });

      await act(async () => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.submitMessage?.type).toBe('success');
        expect(result.current.submitMessage?.text).toContain('Dziękujemy');
      });
    });

    it('should show error message on submission failure', async () => {
      const fetchMock = vi.mocked(global.fetch);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const { result } = renderHook(() => useFeedback('plan-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      act(() => {
        result.current.updateRating('thumbs_up');
      });

      await act(async () => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.submitMessage?.type).toBe('error');
      });
    });
  });
});
