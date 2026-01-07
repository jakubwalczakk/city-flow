import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePasswordRecoverySession } from '@/hooks/usePasswordRecoverySession';
import { supabaseClient } from '@/db/supabase.client';

// Mock supabase client
vi.mock('@/db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('usePasswordRecoverySession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with verifying status', () => {
      vi.mocked(supabaseClient.auth.getSession).mockImplementation(
        () =>
          new Promise(() => {
            /* never resolves */
          })
      );

      const { result } = renderHook(() => usePasswordRecoverySession());

      expect(result.current.status).toBe('verifying');
      expect(result.current.isVerifying).toBe(true);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isInvalid).toBe(false);
    });
  });

  describe('valid session', () => {
    it('should set status to valid when session exists', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: {
          session: { user: { id: 'user-1' }, access_token: 'token' },
        },
        error: null,
      } as Awaited<ReturnType<typeof supabaseClient.auth.getSession>>);

      const { result } = renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(result.current.status).toBe('valid');
      });

      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isInvalid).toBe(false);
    });
  });

  describe('invalid session', () => {
    it('should set status to invalid when no session', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(result.current.status).toBe('invalid');
      });

      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isInvalid).toBe(true);
    });

    it('should set status to invalid on error', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(result.current.status).toBe('invalid');
      });

      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isInvalid).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('should correctly compute boolean flags for verifying state', () => {
      vi.mocked(supabaseClient.auth.getSession).mockImplementation(
        () =>
          new Promise(() => {
            /* never resolves */
          })
      );

      const { result } = renderHook(() => usePasswordRecoverySession());

      expect(result.current.status).toBe('verifying');
      expect(result.current.isVerifying).toBe(true);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isInvalid).toBe(false);
    });

    it('should correctly compute boolean flags for valid state', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null,
      } as Awaited<ReturnType<typeof supabaseClient.auth.getSession>>);

      const { result } = renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      expect(result.current.status).toBe('valid');
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isInvalid).toBe(false);
    });

    it('should correctly compute boolean flags for invalid state', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(result.current.isInvalid).toBe(true);
      });

      expect(result.current.status).toBe('invalid');
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('session verification', () => {
    it('should call getSession once on mount', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalledTimes(1);
      });
    });

    it('should not re-verify on re-render', async () => {
      vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { rerender } = renderHook(() => usePasswordRecoverySession());

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalledTimes(1);
      });

      rerender();

      // Should still be only 1 call (useEffect with empty deps)
      expect(supabaseClient.auth.getSession).toHaveBeenCalledTimes(1);
    });
  });
});
