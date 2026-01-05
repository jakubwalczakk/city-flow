import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfile } from '@/hooks/useProfile';
import type { ProfileDto } from '@/types';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

describe('useProfile', () => {
  const mockProfile: ProfileDto = {
    id: 'user-1',
    preferences: ['Art', 'Food'],
    travel_pace: 'moderate',
    onboarding_completed: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading state', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeNull();

      await waitFor(() => {
        // Wait for effect to complete to avoid act warning
        expect(result.current.isLoading).toBeDefined();
      });
    });

    it('should fetch profile on mount', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/profiles'), expect.any(Object));
    });

    it('should handle 404 for new user without profile', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle 401 - redirect to login', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      });
      global.fetch = mockFetch;

      renderHook(() => useProfile());

      await waitFor(() => {
        expect(window.location.href).toBe('/');
      });
    });
  });

  describe('profile errors', () => {
    it('should handle fetch errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.profile).toBeNull();
    });

    it('should handle network errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network failed'));
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Network failed');
    });
  });

  describe('profile updates', () => {
    it('should provide updateProfile method', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      expect(result.current.updateProfile).toBeTypeOf('function');
    });

    it('should update profile successfully', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockProfile,
              travel_pace: 'intensive',
            }),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      const updateData = { travel_pace: 'intensive' as const };

      await act(async () => {
        await result.current.updateProfile(updateData);
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('should handle update errors', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid preferences' }),
        });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      const updateData = { preferences: [] };

      await act(async () => {
        try {
          await result.current.updateProfile(updateData);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('refetch', () => {
    it('should provide refetch method', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      expect(result.current.refetch).toBeTypeOf('function');

      const initialCallCount = mockFetch.mock.calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});
