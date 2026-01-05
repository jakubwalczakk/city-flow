import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanService, convertTo24Hour } from '@/lib/services/plan.service';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import type { SupabaseClient } from '@/db/supabase.client';
import type { CreatePlanCommand, UpdatePlanCommand, PlanDetailsDto } from '@/types';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

// Helper to create mock Supabase client
function createMockSupabaseClient() {
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockIn = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockRange = vi.fn().mockReturnThis();
  const mockSingle = vi.fn();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();

  return {
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      select: mockSelect,
      eq: mockEq,
      in: mockIn,
      order: mockOrder,
      range: mockRange,
      single: mockSingle,
    })),
    _mockHelpers: {
      mockSelect,
      mockEq,
      mockIn,
      mockOrder,
      mockRange,
      mockSingle,
      mockInsert,
      mockUpdate,
      mockDelete,
    },
  } as unknown as SupabaseClient & {
    _mockHelpers: {
      mockSelect: ReturnType<typeof vi.fn>;
      mockEq: ReturnType<typeof vi.fn>;
      mockIn: ReturnType<typeof vi.fn>;
      mockOrder: ReturnType<typeof vi.fn>;
      mockRange: ReturnType<typeof vi.fn>;
      mockSingle: ReturnType<typeof vi.fn>;
      mockInsert: ReturnType<typeof vi.fn>;
      mockUpdate: ReturnType<typeof vi.fn>;
      mockDelete: ReturnType<typeof vi.fn>;
    };
  };
}

describe('PlanService', () => {
  describe('convertTo24Hour - pure function', () => {
    it('should convert 2:30 PM to 14:30', () => {
      expect(convertTo24Hour('2:30 PM')).toBe('14:30');
    });

    it('should convert 2:30 pm to 14:30 (lowercase)', () => {
      expect(convertTo24Hour('2:30 pm')).toBe('14:30');
    });

    it('should convert 12:00 AM to 00:00', () => {
      expect(convertTo24Hour('12:00 AM')).toBe('00:00');
    });

    it('should convert 12:00 PM to 12:00', () => {
      expect(convertTo24Hour('12:00 PM')).toBe('12:00');
    });

    it('should convert 1:00 AM to 01:00', () => {
      expect(convertTo24Hour('1:00 AM')).toBe('01:00');
    });

    it('should convert 11:59 PM to 23:59', () => {
      expect(convertTo24Hour('11:59 PM')).toBe('23:59');
    });

    it('should return 24-hour format unchanged', () => {
      expect(convertTo24Hour('14:30')).toBe('14:30');
    });

    it('should pad single-digit hours in 24-hour format', () => {
      expect(convertTo24Hour('9:00')).toBe('09:00');
    });

    it('should handle time without spaces before AM/PM', () => {
      expect(convertTo24Hour('2:30PM')).toBe('14:30');
    });

    it('should handle extra whitespace', () => {
      expect(convertTo24Hour('  2:30 PM  ')).toBe('14:30');
    });

    it('should return original if unparseable', () => {
      const invalid = 'invalid time';
      expect(convertTo24Hour(invalid)).toBe(invalid);
    });
  });

  describe('PlanService - CRUD operations', () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    let planService: PlanService;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      planService = new PlanService(mockSupabase as unknown as SupabaseClient);
      vi.clearAllMocks();
    });

    describe('constructor', () => {
      it('should accept SupabaseClient directly', () => {
        const service = new PlanService(mockSupabase as unknown as SupabaseClient);
        expect(service).toBeInstanceOf(PlanService);
      });

      it('should extract supabase from App.Locals', () => {
        const locals = { supabase: mockSupabase } as unknown as App.Locals;
        const service = new PlanService(locals);
        expect(service).toBeInstanceOf(PlanService);
      });
    });

    describe('createPlan', () => {
      const command: CreatePlanCommand = {
        name: 'Paris Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: 'Visit Eiffel Tower',
      };

      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Paris Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: 'Visit Eiffel Tower',
        status: 'draft',
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      it('should successfully create a plan', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: mockPlan,
          error: null,
        });

        const result = await planService.createPlan(command, 'user-1');

        expect(result).toEqual(mockPlan);
        expect(mockSupabase.from).toHaveBeenCalledWith('plans');
        expect(mockSupabase._mockHelpers.mockInsert).toHaveBeenCalledWith({
          ...command,
          user_id: 'user-1',
          status: 'draft',
        });
      });

      it('should throw DatabaseError on failure', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'Duplicate key' },
        });

        await expect(planService.createPlan(command, 'user-1')).rejects.toThrow(DatabaseError);
      });

      it('should log debug at start', async () => {
        const { logger } = await import('@/lib/utils/logger');

        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: mockPlan,
          error: null,
        });

        await planService.createPlan(command, 'user-1');

        expect(logger.debug).toHaveBeenCalledWith('Creating new plan', {
          userId: 'user-1',
          destination: 'Paris',
        });
      });
    });

    describe('getPlanById', () => {
      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Paris Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: null,
        status: 'draft',
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      it('should successfully retrieve a plan', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: mockPlan,
          error: null,
        });

        const result = await planService.getPlanById('plan-1', 'user-1');

        expect(result).toEqual(mockPlan);
        expect(mockSupabase.from).toHaveBeenCalledWith('plans');
        expect(mockSupabase._mockHelpers.mockEq).toHaveBeenCalledWith('id', 'plan-1');
        expect(mockSupabase._mockHelpers.mockEq).toHaveBeenCalledWith('user_id', 'user-1');
      });

      it('should throw NotFoundError when plan does not exist', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows' },
        });

        await expect(planService.getPlanById('plan-1', 'user-1')).rejects.toThrow(NotFoundError);
      });

      it('should throw DatabaseError on other errors', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'Connection error' },
        });

        await expect(planService.getPlanById('plan-1', 'user-1')).rejects.toThrow(DatabaseError);
      });
    });

    describe('updatePlan', () => {
      const command: UpdatePlanCommand = {
        name: 'Updated Paris Trip',
      };

      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Updated Paris Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: null,
        status: 'draft',
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      it('should successfully update a plan', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: mockPlan,
          error: null,
        });

        const result = await planService.updatePlan('plan-1', command);

        expect(result).toEqual(mockPlan);
        expect(mockSupabase.from).toHaveBeenCalledWith('plans');
        expect(mockSupabase._mockHelpers.mockUpdate).toHaveBeenCalledWith(command);
        expect(mockSupabase._mockHelpers.mockEq).toHaveBeenCalledWith('id', 'plan-1');
      });

      it('should throw DatabaseError on failure', async () => {
        mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'Update failed' },
        });

        await expect(planService.updatePlan('plan-1', command)).rejects.toThrow(DatabaseError);
      });
    });

    // Note: deletePlan and getPlans use complex Supabase chaining that's difficult to mock
    // These are better tested as integration tests
  });
});
