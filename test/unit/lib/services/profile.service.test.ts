import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '@/lib/services/profile.service';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import type { SupabaseClient } from '@/db/supabase.client';
import type { UpdateProfileCommand } from '@/types';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create mock Supabase client
function createMockSupabaseClient() {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();

  const chainable = {
    select: mockSelect,
    update: mockUpdate,
    eq: mockEq,
    single: mockSingle,
  };

  mockFrom.mockReturnValue(chainable);
  mockSelect.mockReturnValue(chainable);
  mockUpdate.mockReturnValue(chainable);
  mockEq.mockReturnValue(chainable);
  mockSingle.mockReturnValue({ data: null, error: null });

  return {
    from: mockFrom,
    mocks: {
      from: mockFrom,
      select: mockSelect,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
    },
  };
}

describe('ProfileService', () => {
  let service: ProfileService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new ProfileService(mockSupabase as unknown as SupabaseClient);
  });

  describe('constructor', () => {
    it('should accept SupabaseClient directly', () => {
      const svc = new ProfileService(mockSupabase as unknown as SupabaseClient);
      expect(svc).toBeInstanceOf(ProfileService);
    });

    it('should extract supabase from App.Locals', () => {
      const locals = { supabase: mockSupabase as unknown as SupabaseClient } as App.Locals;
      const svc = new ProfileService(locals);
      expect(svc).toBeInstanceOf(ProfileService);
    });
  });

  describe('findProfileByUserId', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        preferences: ['culture', 'food'],
        travel_pace: 'moderate',
        generations_remaining: 5,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.findProfileByUserId('user-123');

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.mocks.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.mocks.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockSupabase.mocks.single).toHaveBeenCalled();
    });

    it('should return null when profile not found (PGRST116)', async () => {
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await service.findProfileByUserId('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      await expect(service.findProfileByUserId('user-123')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockSupabase.mocks.single.mockRejectedValue(new Error('Network error'));

      await expect(service.findProfileByUserId('user-123')).rejects.toThrow('Network error');
    });
  });

  describe('updateProfile', () => {
    const mockCommand: UpdateProfileCommand = {
      preferences: ['nature', 'sports'],
      travel_pace: 'intensive',
    };

    it('should update profile successfully', async () => {
      const mockUpdatedProfile = {
        id: 'user-123',
        email: 'test@example.com',
        preferences: ['nature', 'sports'],
        travel_pace: 'intensive',
        generations_remaining: 5,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await service.updateProfile('user-123', mockCommand);

      expect(result).toEqual(mockUpdatedProfile);
      expect(mockSupabase.mocks.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: ['nature', 'sports'],
          travel_pace: 'intensive',
          updated_at: expect.any(String),
        })
      );
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockSupabase.mocks.select).toHaveBeenCalled();
      expect(mockSupabase.mocks.single).toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialCommand: UpdateProfileCommand = {
        preferences: ['culture'],
      };

      const mockUpdatedProfile = {
        id: 'user-123',
        email: 'test@example.com',
        preferences: ['culture'],
        travel_pace: 'moderate',
        generations_remaining: 5,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await service.updateProfile('user-123', partialCommand);

      expect(result).toEqual(mockUpdatedProfile);
      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: ['culture'],
          updated_at: expect.any(String),
        })
      );
    });

    it('should automatically set updated_at timestamp', async () => {
      const mockUpdatedProfile = {
        id: 'user-123',
        email: 'test@example.com',
        preferences: ['nature', 'sports'],
        travel_pace: 'intensive',
        generations_remaining: 5,
        created_at: '2024-01-01',
        updated_at: expect.any(String),
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      await service.updateProfile('user-123', mockCommand);

      const updateCall = mockSupabase.mocks.update.mock.calls[0][0];
      expect(updateCall.updated_at).toBeDefined();
      expect(typeof updateCall.updated_at).toBe('string');
    });

    it('should throw DatabaseError on update failure', async () => {
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      await expect(service.updateProfile('user-123', mockCommand)).rejects.toThrow(DatabaseError);
      await expect(service.updateProfile('user-123', mockCommand)).rejects.toThrow('Failed to update profile.');
    });

    it('should log debug messages on success', async () => {
      const { logger } = await import('@/lib/utils/logger');

      const mockUpdatedProfile = {
        id: 'user-123',
        email: 'test@example.com',
        preferences: ['nature', 'sports'],
        travel_pace: 'intensive',
        generations_remaining: 5,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      await service.updateProfile('user-123', mockCommand);

      expect(logger.debug).toHaveBeenCalledWith('Updating profile', expect.any(Object));
      expect(logger.debug).toHaveBeenCalledWith('Profile updated successfully', expect.any(Object));
    });

    it('should log error on failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      try {
        await service.updateProfile('user-123', mockCommand);
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('hasGenerationsRemaining', () => {
    it('should return true when user has generations remaining', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 5,
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.hasGenerationsRemaining('user-123');

      expect(result).toBe(true);
    });

    it('should return false when user has 0 generations remaining', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 0,
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.hasGenerationsRemaining('user-123');

      expect(result).toBe(false);
    });

    it('should return true when user has exactly 1 generation remaining', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 1,
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.hasGenerationsRemaining('user-123');

      expect(result).toBe(true);
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      await expect(service.hasGenerationsRemaining('non-existent')).rejects.toThrow(NotFoundError);
      await expect(service.hasGenerationsRemaining('non-existent')).rejects.toThrow('Profile not found');
    });
  });

  describe('decrementGenerations', () => {
    it('should decrement generations successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 5,
      };

      // First call: findProfileByUserId
      mockSupabase.mocks.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      // Second call: update().eq() returns directly
      mockSupabase.mocks.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(service.decrementGenerations('user-123')).resolves.not.toThrow();

      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          generations_remaining: 4,
          updated_at: expect.any(String),
        })
      );
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      await expect(service.decrementGenerations('non-existent')).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError when generations are already 0', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 0,
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      await expect(service.decrementGenerations('user-123')).rejects.toThrow(DatabaseError);
      await expect(service.decrementGenerations('user-123')).rejects.toThrow('No generations remaining.');
    });

    it('should handle user with exactly 1 generation remaining', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 1,
      };

      mockSupabase.mocks.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      mockSupabase.mocks.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await service.decrementGenerations('user-123');

      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          generations_remaining: 0,
        })
      );
    });

    it('should throw DatabaseError on update failure', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 5,
      };

      mockSupabase.mocks.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      mockSupabase.mocks.eq.mockResolvedValueOnce({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      await expect(service.decrementGenerations('user-123')).rejects.toThrow(DatabaseError);

      // Repeat mocks for second call
      mockSupabase.mocks.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      mockSupabase.mocks.eq.mockResolvedValueOnce({
        data: null,
        error: { code: '500', message: 'Database error' },
      });
      await expect(service.decrementGenerations('user-123')).rejects.toThrow('Failed to update user credits.');
    });

    it('should log debug and info messages on success', async () => {
      const { logger } = await import('@/lib/utils/logger');

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 5,
      };

      mockSupabase.mocks.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      mockSupabase.mocks.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await service.decrementGenerations('user-123');

      expect(logger.debug).toHaveBeenCalledWith('Decrementing generations', expect.any(Object));
      expect(logger.info).toHaveBeenCalledWith(
        'Generations decremented successfully',
        expect.objectContaining({
          userId: 'user-123',
          remaining: 4,
        })
      );
    });

    it('should log error on update failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        generations_remaining: 5,
      };

      mockSupabase.mocks.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      mockSupabase.mocks.eq.mockResolvedValueOnce({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      try {
        await service.decrementGenerations('user-123');
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
