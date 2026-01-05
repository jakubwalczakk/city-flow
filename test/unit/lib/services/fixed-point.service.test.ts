import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FixedPointService } from '@/lib/services/fixed-point.service';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import type { SupabaseClient } from '@/db/supabase.client';
import type { CreateFixedPointCommand, UpdateFixedPointCommand, FixedPointDto } from '@/types';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123'),
}));

// Helper to create mock Supabase client
function createMockSupabaseClient() {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();

  const chainable = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
  };

  mockFrom.mockReturnValue(chainable);
  mockSelect.mockReturnValue(chainable);
  mockInsert.mockReturnValue(chainable);
  mockUpdate.mockReturnValue(chainable);
  mockDelete.mockReturnValue(chainable);
  mockEq.mockReturnValue(chainable);
  mockOrder.mockReturnValue(chainable);
  mockSingle.mockReturnValue({ data: null, error: null });

  return {
    client: { from: mockFrom } as unknown as SupabaseClient,
    mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    },
  };
}

describe('FixedPointService', () => {
  let service: FixedPointService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new FixedPointService(mockSupabase.client);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should accept SupabaseClient directly', () => {
      const svc = new FixedPointService(mockSupabase.client);
      expect(svc).toBeInstanceOf(FixedPointService);
    });

    it('should extract supabase from App.Locals', () => {
      const locals = { supabase: mockSupabase.client } as App.Locals;
      const svc = new FixedPointService(locals);
      expect(svc).toBeInstanceOf(FixedPointService);
    });
  });

  describe('createFixedPoint', () => {
    const mockCommand: CreateFixedPointCommand = {
      location: 'Airport',
      event_at: '2024-02-01T10:00:00Z',
      event_duration: 120,
      description: 'Flight arrival',
    };

    it('should create a fixed point successfully', async () => {
      const mockFixedPoint: FixedPointDto = {
        id: 'test-uuid-123',
        plan_id: 'plan-1',
        location: 'Airport',
        event_at: '2024-02-01T10:00:00Z',
        event_duration: 120,
        description: 'Flight arrival',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockFixedPoint,
        error: null,
      });

      const result = await service.createFixedPoint('plan-1', mockCommand, 'user-1');

      expect(result).toEqual(mockFixedPoint);
      expect(mockSupabase.mocks.from).toHaveBeenCalledWith('fixed_points');
      expect(mockSupabase.mocks.insert).toHaveBeenCalledWith({
        id: 'test-uuid-123',
        plan_id: 'plan-1',
        location: 'Airport',
        event_at: '2024-02-01T10:00:00Z',
        event_duration: 120,
        description: 'Flight arrival',
      });
      expect(mockSupabase.mocks.select).toHaveBeenCalled();
      expect(mockSupabase.mocks.single).toHaveBeenCalled();
    });

    it('should handle null event_duration correctly', async () => {
      const commandWithoutDuration = {
        location: 'Hotel',
        event_at: '2024-02-01T15:00:00Z',
        description: 'Check-in',
      };

      const mockFixedPoint: FixedPointDto = {
        id: 'test-uuid-123',
        plan_id: 'plan-1',
        location: 'Hotel',
        event_at: '2024-02-01T15:00:00Z',
        event_duration: null,
        description: 'Check-in',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockFixedPoint,
        error: null,
      });

      const result = await service.createFixedPoint('plan-1', commandWithoutDuration, 'user-1');

      expect(result.event_duration).toBeNull();
      expect(mockSupabase.mocks.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_duration: null,
        })
      );
    });

    it('should throw DatabaseError on database failure', async () => {
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Duplicate key' },
      });

      await expect(service.createFixedPoint('plan-1', mockCommand, 'user-1')).rejects.toThrow(DatabaseError);
    });

    it('should log debug and info messages on success', async () => {
      const { logger } = await import('@/lib/utils/logger');
      const mockFixedPoint: FixedPointDto = {
        id: 'test-uuid-123',
        plan_id: 'plan-1',
        location: 'Airport',
        event_at: '2024-02-01T10:00:00Z',
        event_duration: 120,
        description: 'Flight arrival',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.mocks.single.mockResolvedValue({
        data: mockFixedPoint,
        error: null,
      });

      await service.createFixedPoint('plan-1', mockCommand, 'user-1');

      expect(logger.debug).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error on database failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      try {
        await service.createFixedPoint('plan-1', mockCommand, 'user-1');
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getFixedPointsByPlanId', () => {
    it('should retrieve fixed points successfully', async () => {
      const mockFixedPoints: FixedPointDto[] = [
        {
          id: 'fp-1',
          plan_id: 'plan-1',
          location: 'Airport',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 120,
          description: 'Arrival',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'fp-2',
          plan_id: 'plan-1',
          location: 'Hotel',
          event_at: '2024-02-01T15:00:00Z',
          event_duration: null,
          description: 'Check-in',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabase.mocks.order.mockResolvedValue({
        data: mockFixedPoints,
        error: null,
      });

      const result = await service.getFixedPointsByPlanId('plan-1');

      expect(result).toEqual(mockFixedPoints);
      expect(mockSupabase.mocks.from).toHaveBeenCalledWith('fixed_points');
      expect(mockSupabase.mocks.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('plan_id', 'plan-1');
      expect(mockSupabase.mocks.order).toHaveBeenCalledWith('event_at', { ascending: true });
    });

    it('should return empty array when no fixed points exist', async () => {
      mockSupabase.mocks.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getFixedPointsByPlanId('plan-1');

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      mockSupabase.mocks.order.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.getFixedPointsByPlanId('plan-1');

      expect(result).toEqual([]);
    });

    it('should throw DatabaseError on database failure', async () => {
      mockSupabase.mocks.order.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      await expect(service.getFixedPointsByPlanId('plan-1')).rejects.toThrow(DatabaseError);
    });

    it('should log error on database failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase.mocks.order.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      try {
        await service.getFixedPointsByPlanId('plan-1');
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateFixedPoint', () => {
    const mockCommand: UpdateFixedPointCommand = {
      location: 'Updated Airport',
      event_at: '2024-02-01T11:00:00Z',
      event_duration: 90,
      description: 'Updated arrival',
    };

    it('should update a fixed point successfully', async () => {
      const mockUpdatedPoint: FixedPointDto = {
        id: 'fp-1',
        plan_id: 'plan-1',
        location: 'Updated Airport',
        event_at: '2024-02-01T11:00:00Z',
        event_duration: 90,
        description: 'Updated arrival',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedPoint,
        error: null,
      });

      const result = await service.updateFixedPoint('plan-1', 'fp-1', mockCommand);

      expect(result).toEqual(mockUpdatedPoint);
      expect(mockSupabase.mocks.from).toHaveBeenCalledWith('fixed_points');
      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          location: 'Updated Airport',
          event_at: '2024-02-01T11:00:00Z',
          event_duration: 90,
          description: 'Updated arrival',
          updated_at: expect.any(String),
        })
      );
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('id', 'fp-1');
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('plan_id', 'plan-1');
    });

    it('should handle partial updates', async () => {
      const partialCommand: UpdateFixedPointCommand = {
        location: 'New Location',
      };

      const mockUpdatedPoint: FixedPointDto = {
        id: 'fp-1',
        plan_id: 'plan-1',
        location: 'New Location',
        event_at: '2024-02-01T10:00:00Z',
        event_duration: 120,
        description: 'Original description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedPoint,
        error: null,
      });

      await service.updateFixedPoint('plan-1', 'fp-1', partialCommand);

      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          location: 'New Location',
          updated_at: expect.any(String),
        })
      );
    });

    it('should handle null event_duration', async () => {
      const commandWithNullDuration: UpdateFixedPointCommand = {
        event_duration: null,
      };

      const mockUpdatedPoint: FixedPointDto = {
        id: 'fp-1',
        plan_id: 'plan-1',
        location: 'Airport',
        event_at: '2024-02-01T10:00:00Z',
        event_duration: null,
        description: 'Arrival',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: mockUpdatedPoint,
        error: null,
      });

      await service.updateFixedPoint('plan-1', 'fp-1', commandWithNullDuration);

      expect(mockSupabase.mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          event_duration: null,
        })
      );
    });

    it('should throw NotFoundError when fixed point does not exist', async () => {
      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      await expect(service.updateFixedPoint('plan-1', 'fp-1', mockCommand)).rejects.toThrow(NotFoundError);

      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      await expect(service.updateFixedPoint('plan-1', 'fp-1', mockCommand)).rejects.toThrow('Fixed point not found.');
    });

    it('should throw DatabaseError on other database failures', async () => {
      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      await expect(service.updateFixedPoint('plan-1', 'fp-1', mockCommand)).rejects.toThrow(DatabaseError);
    });

    it('should log error on database failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      });

      try {
        await service.updateFixedPoint('plan-1', 'fp-1', mockCommand);
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteFixedPoint', () => {
    it('should delete a fixed point successfully', async () => {
      const finalResult = { data: null, error: null };
      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.eq.mockResolvedValueOnce(finalResult);

      await expect(service.deleteFixedPoint('plan-1', 'fp-1')).resolves.not.toThrow();

      expect(mockSupabase.mocks.from).toHaveBeenCalledWith('fixed_points');
      expect(mockSupabase.mocks.delete).toHaveBeenCalled();
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('id', 'fp-1');
      expect(mockSupabase.mocks.eq).toHaveBeenCalledWith('plan_id', 'plan-1');
    });

    it('should throw DatabaseError on database failure', async () => {
      const errorResult = { data: null, error: { code: '500', message: 'Database error' } };
      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.eq.mockResolvedValueOnce(errorResult);

      await expect(service.deleteFixedPoint('plan-1', 'fp-1')).rejects.toThrow(DatabaseError);
    });

    it('should log error on database failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      const errorResult = { data: null, error: { code: '500', message: 'Database error' } };
      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.eq.mockResolvedValueOnce(errorResult);

      try {
        await service.deleteFixedPoint('plan-1', 'fp-1');
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });

    it('should not throw error if fixed point does not exist', async () => {
      const finalResult = { data: null, error: null };
      mockSupabase.mocks.eq.mockReturnValueOnce(mockSupabase.mocks);
      mockSupabase.mocks.eq.mockResolvedValueOnce(finalResult);

      await expect(service.deleteFixedPoint('plan-1', 'non-existent')).resolves.not.toThrow();
    });
  });
});
