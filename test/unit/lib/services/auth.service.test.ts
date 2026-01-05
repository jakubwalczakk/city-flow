/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/lib/services/auth.service';
import { ForbiddenError } from '@/lib/errors/app-error';
import type { SupabaseClient } from '@/db/supabase.client';
import type { User } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Helper to create AuthError
function createAuthError(message: string): AuthError {
  return new AuthError(message, 401, 'auth_error');
}

// Helper to create mock Supabase client
function createMockSupabaseClient(): SupabaseClient {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(),
    // Add other methods if needed
  } as unknown as SupabaseClient;
}

describe('AuthService', () => {
  let mockSupabase: SupabaseClient;
  let authService: AuthService;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    authService = new AuthService(mockSupabase);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should accept SupabaseClient directly', () => {
      const service = new AuthService(mockSupabase);
      expect(service).toBeInstanceOf(AuthService);
    });

    it('should extract supabase from App.Locals', () => {
      const locals = { supabase: mockSupabase } as App.Locals;
      const service = new AuthService(locals);
      expect(service).toBeInstanceOf(AuthService);
    });
  });

  describe('getUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        app_metadata: {},
        user_metadata: {},
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await authService.getUser();

      expect(user).toEqual(mockUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalledOnce();
    });

    it('should throw ForbiddenError when user is null', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null as any },
        error: null,
      } as any);

      await expect(authService.getUser()).rejects.toThrow(ForbiddenError);
      await expect(authService.getUser()).rejects.toThrow('You must be logged in.');
    });

    it('should throw ForbiddenError when there is an error', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null as any },
        error: createAuthError('Auth error'),
      } as any);

      await expect(authService.getUser()).rejects.toThrow(ForbiddenError);
    });

    it('should log warning when user is not authenticated', async () => {
      const { logger } = await import('@/lib/utils/logger');

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null as any },
        error: createAuthError('Not authenticated'),
      } as any);

      try {
        await authService.getUser();
      } catch {
        // Expected to throw
      }

      expect(logger.warn).toHaveBeenCalledWith('Unauthenticated request');
    });

    it('should throw ForbiddenError when getUser returns undefined user', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: undefined as any },
        error: null,
      } as any);

      await expect(authService.getUser()).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getUserId', () => {
    it('should return user id when authenticated', async () => {
      const mockUser: User = {
        id: 'user-456',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        app_metadata: {},
        user_metadata: {},
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const userId = await authService.getUserId();

      expect(userId).toBe('user-456');
    });

    it('should throw ForbiddenError when user is not authenticated', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null as any },
        error: createAuthError('Not authenticated'),
      } as any);

      await expect(authService.getUserId()).rejects.toThrow(ForbiddenError);
    });

    it('should call getUser method internally', async () => {
      const mockUser: User = {
        id: 'user-789',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        app_metadata: {},
        user_metadata: {},
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await authService.getUserId();

      // Verify getUser was called (via auth.getUser)
      expect(mockSupabase.auth.getUser).toHaveBeenCalledOnce();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockRejectedValue(new Error('Network error'));

      await expect(authService.getUser()).rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: undefined as any },
        error: null,
      } as any);

      await expect(authService.getUser()).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError with correct message', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null as any },
        error: null,
      } as any);

      try {
        await authService.getUser();
        expect.fail('Should have thrown ForbiddenError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ForbiddenError);
        expect(error.message).toBe('You must be logged in.');
        expect(error.statusCode).toBe(403);
      }
    });
  });
});
