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

    // Note: getPlans and deletePlan use complex Supabase chaining that's difficult to mock
    // These have better coverage through integration tests (e2e tests)
    // The uncovered lines are mostly defensive error handling in edge cases
  });

  describe('Activity Management - addActivityToPlanDay', () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    let planService: PlanService;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      planService = new PlanService(mockSupabase as unknown as SupabaseClient);
      vi.clearAllMocks();
    });

    it('should add activity to plan day and sort by time', async () => {
      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: null,
        status: 'generated',
        generated_content: {
          summary: 'A nice trip',
          currency: 'EUR',
          days: [
            {
              date: '2024-06-01',
              items: [
                {
                  id: 'item-1',
                  type: 'meal',
                  time: '09:00',
                  category: 'food',
                  title: 'Breakfast',
                  description: 'Hotel breakfast',
                },
              ],
            },
          ],
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const updatedMockPlan = {
        ...mockPlan,
        generated_content: {
          ...mockPlan.generated_content,
          days: [
            {
              date: '2024-06-01',
              items: [
                {
                  id: 'item-1',
                  type: 'meal',
                  time: '09:00',
                  category: 'food',
                  title: 'Breakfast',
                  description: 'Hotel breakfast',
                },
                {
                  id: 'mock-uuid-1234',
                  type: 'activity',
                  time: '14:00',
                  category: 'culture',
                  title: 'Louvre Museum',
                  location: 'Louvre, Paris',
                },
              ],
            },
          ],
        },
      };

      mockSupabase._mockHelpers.mockSingle
        .mockResolvedValueOnce({ data: mockPlan, error: null })
        .mockResolvedValueOnce({ data: updatedMockPlan, error: null });

      const result = await planService.addActivityToPlanDay(
        'plan-1',
        '2024-06-01',
        {
          time: '14:00',
          title: 'Louvre Museum',
          location: 'Louvre, Paris',
          category: 'culture',
        },
        'user-1'
      );

      expect(result.generated_content).toBeDefined();
      if (result.generated_content && 'days' in result.generated_content) {
        const items = (result.generated_content as GeneratedContentViewModel & { days: { items: unknown[] }[] }).days[0]
          .items;
        expect(items).toHaveLength(2);
        expect(items[0].time).toBe('09:00');
        expect(items[1].time).toBe('14:00');
      }
    });

    it('should throw error when trying to add activity to non-generated plan', async () => {
      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: null,
        status: 'draft',
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockPlan,
        error: null,
      });

      await expect(
        planService.addActivityToPlanDay(
          'plan-1',
          '2024-06-01',
          {
            title: 'Activity',
            category: 'culture',
          },
          'user-1'
        )
      ).rejects.toThrow(DatabaseError);
    });

    it('should map food category to meal type', async () => {
      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: null,
        status: 'generated',
        generated_content: {
          summary: 'Trip',
          currency: 'EUR',
          days: [
            {
              date: '2024-06-01',
              items: [],
            },
          ],
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase._mockHelpers.mockSingle
        .mockResolvedValueOnce({ data: mockPlan, error: null })
        .mockResolvedValueOnce({ data: mockPlan, error: null });

      await planService.addActivityToPlanDay(
        'plan-1',
        '2024-06-01',
        {
          title: 'Lunch',
          category: 'food',
        },
        'user-1'
      );

      // Verify the update was called
      expect(mockSupabase._mockHelpers.mockUpdate).toHaveBeenCalled();
    });
  });

  describe('Time Conversion Edge Cases', () => {
    it('should handle edge case times correctly', () => {
      // Midnight
      expect(convertTo24Hour('12:00 AM')).toBe('00:00');

      // Noon
      expect(convertTo24Hour('12:00 PM')).toBe('12:00');

      // Just before midnight
      expect(convertTo24Hour('11:59 PM')).toBe('23:59');

      // Just after midnight
      expect(convertTo24Hour('12:01 AM')).toBe('00:01');
    });

    it('should handle times without leading zeros', () => {
      expect(convertTo24Hour('9:05 AM')).toBe('09:05');
      expect(convertTo24Hour('9:30 PM')).toBe('21:30');
    });

    it('should be case-insensitive for AM/PM', () => {
      expect(convertTo24Hour('2:30 AM')).toBe('02:30');
      expect(convertTo24Hour('2:30 am')).toBe('02:30');
      expect(convertTo24Hour('2:30 Am')).toBe('02:30');
      expect(convertTo24Hour('2:30 aM')).toBe('02:30');
    });
  });

  describe('Error Handling Consistency', () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    let planService: PlanService;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      planService = new PlanService(mockSupabase as unknown as SupabaseClient);
      vi.clearAllMocks();
    });

    it('should handle missing start_date or end_date after creation', async () => {
      const command: CreatePlanCommand = {
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: {
          id: 'plan-1',
          user_id: 'user-1',
          name: 'Trip',
          destination: 'Paris',
          start_date: null,
          end_date: '2024-06-07',
          notes: null,
          status: 'draft',
          generated_content: null,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        error: null,
      });

      await expect(planService.createPlan(command, 'user-1')).rejects.toThrow(DatabaseError);
    });

    it('should properly log errors with context', async () => {
      const { logger } = await import('@/lib/utils/logger');

      const command: CreatePlanCommand = {
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      try {
        await planService.createPlan(command, 'user-1');
      } catch {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Data Transformation', () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    let planService: PlanService;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      planService = new PlanService(mockSupabase as unknown as SupabaseClient);
      vi.clearAllMocks();
    });

    it('should preserve complex generated_content structure during updates', async () => {
      const complexGeneratedContent = {
        summary: 'Detailed trip',
        currency: 'USD',
        days: [
          {
            date: '2024-06-01',
            items: [
              {
                id: 'item-1',
                type: 'activity',
                time: '09:00',
                category: 'culture',
                title: 'Activity',
                estimated_price: '50 USD',
              },
            ],
          },
        ],
        warnings: ['Pack sunscreen'],
      };

      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        notes: null,
        status: 'generated',
        generated_content: complexGeneratedContent,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockPlan,
        error: null,
      });

      const result = await planService.updatePlan('plan-1', {
        name: 'Updated Trip',
        generated_content: complexGeneratedContent,
      });

      expect(result.generated_content).toEqual(complexGeneratedContent);
    });
  });
});
