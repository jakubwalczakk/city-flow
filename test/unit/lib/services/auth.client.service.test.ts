/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService, AuthError } from '@/lib/services/auth.client.service';
import type { User } from '@supabase/supabase-js';

// Mock supabaseClient
vi.mock('@/db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

import { supabaseClient } from '@/db/supabase.client';

const mockSignInWithPassword = vi.mocked(supabaseClient.auth.signInWithPassword);
const mockSignUp = vi.mocked(supabaseClient.auth.signUp);
const mockResetPasswordForEmail = vi.mocked(supabaseClient.auth.resetPasswordForEmail);
const mockUpdateUser = vi.mocked(supabaseClient.auth.updateUser);
const mockSignOut = vi.mocked(supabaseClient.auth.signOut);

describe('AuthService (client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
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

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw AuthError when login fails with error', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(AuthError);

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw AuthError when user is null', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(AuthError);

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Authentication failed');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser: User = {
        id: 'user-456',
        email: 'newuser@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        app_metadata: {},
        user_metadata: {},
      };

      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      const result = await AuthService.register({
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirmed: true,
          },
        },
      });
    });

    it('should throw AuthError when registration fails with error', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already exists' },
      });

      await expect(
        AuthService.register({
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(AuthError);

      await expect(
        AuthService.register({
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User already exists');
    });

    it('should throw AuthError when user is null', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(
        AuthService.register({
          email: 'newuser@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(AuthError);

      await expect(
        AuthService.register({
          email: 'newuser@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Registration failed');
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      // Mock window.location.origin
      global.window = {
        location: {
          origin: 'http://localhost:3000',
        },
      } as any;
    });

    it('should successfully send password reset email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      await expect(AuthService.resetPassword('test@example.com')).resolves.not.toThrow();

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:3000/update-password',
      });
    });

    it('should throw AuthError when password reset fails', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email not found' },
      });

      await expect(AuthService.resetPassword('notfound@example.com')).rejects.toThrow(AuthError);

      await expect(AuthService.resetPassword('notfound@example.com')).rejects.toThrow('Email not found');
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: {} },
        error: null,
      });

      await expect(AuthService.updatePassword('newpassword123')).resolves.not.toThrow();

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should throw AuthError when password update fails', async () => {
      mockUpdateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password update failed' },
      });

      await expect(AuthService.updatePassword('newpassword123')).rejects.toThrow(AuthError);

      await expect(AuthService.updatePassword('newpassword123')).rejects.toThrow('Password update failed');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSignOut.mockResolvedValue({
        error: null,
      });

      await expect(AuthService.signOut()).resolves.not.toThrow();

      expect(mockSignOut).toHaveBeenCalledOnce();
    });

    it('should throw AuthError when sign out fails', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      await expect(AuthService.signOut()).rejects.toThrow(AuthError);

      await expect(AuthService.signOut()).rejects.toThrow('Sign out failed');
    });
  });
});

describe('AuthError', () => {
  it('should create an AuthError instance', () => {
    const error = new AuthError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('AuthError');
  });

  it('should be catchable as Error', () => {
    try {
      throw new AuthError('Test error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
    }
  });
});
