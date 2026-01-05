import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { supabaseClient } from '@/db/supabase.client';

// Mock supabase client
vi.mock('@/db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe('useGoogleAuth', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location.origin
    delete (window as unknown as { location: unknown }).location;
    window.location = { origin: 'http://localhost:3000' } as unknown as Location;

    vi.clearAllMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useGoogleAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide handleGoogleAuth function', () => {
      const { result } = renderHook(() => useGoogleAuth());

      expect(result.current.handleGoogleAuth).toBeInstanceOf(Function);
    });

    it('should provide clearError function', () => {
      const { result } = renderHook(() => useGoogleAuth());

      expect(result.current.clearError).toBeInstanceOf(Function);
    });
  });

  describe('handleGoogleAuth', () => {
    it('should initiate Google OAuth flow', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/...' },
        error: null,
      } as unknown as AuthError);

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(supabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/plans',
        },
      });
    });

    it('should set isLoading to true during auth', async () => {
      let resolveAuth: (value: { data: object; error: null }) => void = () => {
        /* placeholder */
      };
      const authPromise = new Promise<{ data: object; error: null }>((resolve) => {
        resolveAuth = resolve;
      });

      vi.mocked(supabaseClient.auth.signInWithOAuth).mockReturnValue(
        authPromise as ReturnType<typeof supabaseClient.auth.signInWithOAuth>
      );

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.handleGoogleAuth();
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the auth
      await act(async () => {
        resolveAuth({ data: {}, error: null });
        await authPromise;
      });
    });

    it('should clear previous error when starting auth', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValue({
        data: {},
        error: null,
      } as unknown as AuthError);

      const { result } = renderHook(() => useGoogleAuth());

      // Set an error first
      await act(async () => {
        vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValueOnce({
          data: { provider: 'google', url: null },
          error: { message: 'Previous error' } as unknown as AuthError,
        } as unknown as AuthError);
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).not.toBeNull();

      // Try again with success
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValueOnce({
        data: {},
        error: null,
      } as unknown as AuthError);

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      // Error should be cleared at start
      expect(result.current.error).toBeNull();
    });

    it('should use current window origin for redirect', async () => {
      window.location = { origin: 'https://example.com' } as unknown as AuthError;

      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValue({
        data: {},
        error: null,
      } as unknown as AuthError);

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(supabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://example.com/plans',
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle auth error', async () => {
      const authError = new Error('OAuth failed');
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'google', url: null },
        error: authError,
      } as ReturnType<typeof supabaseClient.auth.signInWithOAuth>);

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).toBe('OAuth failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle Error exception', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error exception', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).toBe('Nie udało się zainicjować logowania przez Google');
      expect(result.current.isLoading).toBe(false);
    });

    it('should keep isLoading false after error', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockRejectedValue(new Error('Auth failed'));

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Auth failed');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useGoogleAuth());

      // Create an error
      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should not affect isLoading state', async () => {
      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('multiple auth attempts', () => {
    it('should handle multiple auth attempts', async () => {
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValue({
        data: {},
        error: null,
      } as unknown as AuthError);

      const { result } = renderHook(() => useGoogleAuth());

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(supabaseClient.auth.signInWithOAuth).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(supabaseClient.auth.signInWithOAuth).toHaveBeenCalledTimes(2);
    });

    it('should recover from error on retry', async () => {
      const { result } = renderHook(() => useGoogleAuth());

      // First attempt fails
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockRejectedValueOnce(new Error('First error'));

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).toBe('First error');

      // Second attempt succeeds
      vi.mocked(supabaseClient.auth.signInWithOAuth).mockResolvedValueOnce({
        data: {},
        error: null,
      } as unknown as AuthError);

      await act(async () => {
        await result.current.handleGoogleAuth();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
