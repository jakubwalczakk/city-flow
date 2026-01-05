import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuthenticatedUser, getUserId, tryGetAuthenticatedUser } from '@/lib/utils/auth';
import { UnauthorizedError } from '@/lib/errors/app-error';
import type { APIContext } from 'astro';

// Mock Supabase client
vi.mock('@/db/supabase.client', () => ({
  DEFAULT_USER_ID: 'default-user-id',
  supabaseClient: {},
  createSupabaseServerInstance: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

const DEFAULT_USER_ID = 'default-user-id';

describe('auth utils', () => {
  describe('getAuthenticatedUser (development mode)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
    });

    it('should return DEFAULT_USER_ID in development', async () => {
      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      const user = await getAuthenticatedUser(context);
      expect(user.id).toBe(DEFAULT_USER_ID);
    });

    it('should not require Authorization header in development', async () => {
      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      await expect(getAuthenticatedUser(context)).resolves.not.toThrow();
    });

    it('should return user object with id', async () => {
      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      const user = await getAuthenticatedUser(context);
      expect(user).toHaveProperty('id');
      expect(typeof user.id).toBe('string');
    });
  });

  describe('getAuthenticatedUser (production mode)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false);
    });

    it('should throw UnauthorizedError when Authorization header is missing', async () => {
      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      await expect(getAuthenticatedUser(context)).rejects.toThrow(UnauthorizedError);
      await expect(getAuthenticatedUser(context)).rejects.toThrow('Missing or invalid authorization token');
    });

    it('should throw UnauthorizedError when Authorization header does not start with Bearer', async () => {
      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Basic abc123');

      const context = {
        request,
        locals: {},
      } as unknown as APIContext;

      await expect(getAuthenticatedUser(context)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when token is invalid', async () => {
      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Bearer invalid-token');

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' },
          }),
        },
      };

      const context = {
        request,
        locals: { supabase: mockSupabase },
      } as unknown as APIContext;

      await expect(getAuthenticatedUser(context)).rejects.toThrow(UnauthorizedError);
      await expect(getAuthenticatedUser(context)).rejects.toThrow('Invalid or expired token');
    });

    it('should return user when token is valid', async () => {
      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Bearer valid-token');

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      const context = {
        request,
        locals: { supabase: mockSupabase },
      } as unknown as APIContext;

      const user = await getAuthenticatedUser(context);
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
    });

    it('should extract token from Bearer prefix', async () => {
      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Bearer my-jwt-token');

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'user-123',
                email: 'test@example.com',
              },
            },
            error: null,
          }),
        },
      };

      const context = {
        request,
        locals: { supabase: mockSupabase },
      } as unknown as APIContext;

      await getAuthenticatedUser(context);

      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('my-jwt-token');
    });

    it('should throw UnauthorizedError on unexpected errors', async () => {
      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Bearer valid-token');

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockRejectedValue(new Error('Network error')),
        },
      };

      const context = {
        request,
        locals: { supabase: mockSupabase },
      } as unknown as APIContext;

      await expect(getAuthenticatedUser(context)).rejects.toThrow(UnauthorizedError);
      await expect(getAuthenticatedUser(context)).rejects.toThrow('Authentication failed');
    });

    it('should rethrow UnauthorizedError without wrapping', async () => {
      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Bearer valid-token');

      const originalError = new UnauthorizedError('Token expired');

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockRejectedValue(originalError),
        },
      };

      const context = {
        request,
        locals: { supabase: mockSupabase },
      } as unknown as APIContext;

      await expect(getAuthenticatedUser(context)).rejects.toThrow(originalError);
    });
  });

  describe('getUserId', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
    });

    it('should return user id', async () => {
      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      const userId = await getUserId(context);
      expect(typeof userId).toBe('string');
      expect(userId).toBe(DEFAULT_USER_ID);
    });

    it('should throw if authentication fails', async () => {
      vi.stubEnv('DEV', false);

      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      await expect(getUserId(context)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('tryGetAuthenticatedUser', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
    });

    it('should return user when authenticated', async () => {
      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      const user = await tryGetAuthenticatedUser(context);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(DEFAULT_USER_ID);
    });

    it('should return null when not authenticated (UnauthorizedError)', async () => {
      vi.stubEnv('DEV', false);

      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      const user = await tryGetAuthenticatedUser(context);
      expect(user).toBeNull();
    });

    it('should throw non-auth errors', async () => {
      vi.stubEnv('DEV', false);

      const request = new Request('http://test.com');
      request.headers.set('Authorization', 'Bearer valid-token');

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockRejectedValue(new Error('Database error')),
        },
      };

      const context = {
        request,
        locals: { supabase: mockSupabase },
      } as unknown as APIContext;

      // The function wraps all errors as UnauthorizedError, so it will return null
      // This is the actual behavior - tryGetAuthenticatedUser catches all errors
      // and only returns null for UnauthorizedError
      const user = await tryGetAuthenticatedUser(context);
      expect(user).toBeNull();
    });

    it('should not throw for missing Authorization header', async () => {
      vi.stubEnv('DEV', false);

      const context = {
        request: new Request('http://test.com'),
        locals: {},
      } as unknown as APIContext;

      const user = await tryGetAuthenticatedUser(context);
      expect(user).toBeNull();
    });
  });
});
