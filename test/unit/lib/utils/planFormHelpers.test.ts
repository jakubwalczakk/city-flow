import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDefaultStartDate,
  getDefaultEndDate,
  determineStartingStep,
  convertFixedPointsToFormItems,
  generateDefaultPlanName,
} from '@/lib/utils/planFormHelpers';
import type { PlanDetailsDto, FixedPointDto } from '@/types';

describe('planFormHelpers', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-15 12:00:00
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDefaultStartDate', () => {
    it('should return tomorrow at 9:00 AM', () => {
      const result = getDefaultStartDate();

      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(16); // Tomorrow
      expect(result.getMonth()).toBe(0); // January (0-indexed)
      expect(result.getFullYear()).toBe(2024);
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle month rollover', () => {
      vi.setSystemTime(new Date('2024-01-31T12:00:00Z'));
      const result = getDefaultStartDate();

      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(1);
    });

    it('should handle year rollover', () => {
      vi.setSystemTime(new Date('2024-12-31T12:00:00Z'));
      const result = getDefaultStartDate();

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });
  });

  describe('getDefaultEndDate', () => {
    it('should return 3 days from tomorrow at 18:00 (4 days from now)', () => {
      const result = getDefaultEndDate();

      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(19); // 4 days from Jan 15
      expect(result.getMonth()).toBe(0); // January
      expect(result.getFullYear()).toBe(2024);
      expect(result.getHours()).toBe(18);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle month rollover', () => {
      vi.setSystemTime(new Date('2024-01-29T12:00:00Z'));
      const result = getDefaultEndDate();

      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(2);
    });

    it('should handle year rollover', () => {
      vi.setSystemTime(new Date('2024-12-29T12:00:00Z'));
      const result = getDefaultEndDate();

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(2);
    });
  });

  describe('determineStartingStep', () => {
    it('should return 0 when basic info is missing', () => {
      const plan = {
        id: '1',
        name: '',
        destination: '',
        start_date: null,
        end_date: null,
        status: 'draft',
        user_id: 'user1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      } as unknown as PlanDetailsDto;

      const result = determineStartingStep(plan);
      expect(result).toBe(0);
    });

    it('should return 0 when name is missing', () => {
      const plan = {
        id: '1',
        name: '',
        destination: 'Paris',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        status: 'draft',
        user_id: 'user1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      } as unknown as PlanDetailsDto;

      const result = determineStartingStep(plan);
      expect(result).toBe(0);
    });

    it('should return 0 when destination is missing', () => {
      const plan = {
        id: '1',
        name: 'My Trip',
        destination: '',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        status: 'draft',
        user_id: 'user1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      } as unknown as PlanDetailsDto;

      const result = determineStartingStep(plan);
      expect(result).toBe(0);
    });

    it('should return 0 when start_date is missing', () => {
      const plan = {
        id: '1',
        name: 'My Trip',
        destination: 'Paris',
        start_date: null,
        end_date: '2024-02-05',
        status: 'draft',
        user_id: 'user1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      } as unknown as PlanDetailsDto;

      const result = determineStartingStep(plan);
      expect(result).toBe(0);
    });

    it('should return 0 when end_date is missing', () => {
      const plan = {
        id: '1',
        name: 'My Trip',
        destination: 'Paris',
        start_date: '2024-02-01',
        end_date: null,
        status: 'draft',
        user_id: 'user1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      } as unknown as PlanDetailsDto;

      const result = determineStartingStep(plan);
      expect(result).toBe(0);
    });

    it('should return 1 when all basic info is complete', () => {
      const plan = {
        id: '1',
        name: 'My Trip',
        destination: 'Paris',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        status: 'draft',
        user_id: 'user1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      } as unknown as PlanDetailsDto;

      const result = determineStartingStep(plan);
      expect(result).toBe(1);
    });
  });

  describe('convertFixedPointsToFormItems', () => {
    it('should convert empty array', () => {
      const result = convertFixedPointsToFormItems([]);
      expect(result).toEqual([]);
    });

    it('should convert single fixed point to form item', () => {
      const fixedPoints: FixedPointDto[] = [
        {
          id: 'fp1',
          plan_id: 'plan1',
          location: 'Eiffel Tower',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 120,
          description: 'Visit the tower',
          created_at: '2024-01-15',
        },
      ];

      const result = convertFixedPointsToFormItems(fixedPoints);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'fp1',
        location: 'Eiffel Tower',
        event_at: '2024-02-01T10:00:00Z',
        event_duration: 120,
        description: 'Visit the tower',
      });
    });

    it('should convert multiple fixed points', () => {
      const fixedPoints: FixedPointDto[] = [
        {
          id: 'fp1',
          plan_id: 'plan1',
          location: 'Eiffel Tower',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 120,
          description: 'Visit the tower',
          created_at: '2024-01-15',
        },
        {
          id: 'fp2',
          plan_id: 'plan1',
          location: 'Louvre Museum',
          event_at: '2024-02-01T14:00:00Z',
          event_duration: 180,
          description: 'Art museum',
          created_at: '2024-01-15',
        },
      ];

      const result = convertFixedPointsToFormItems(fixedPoints);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('fp1');
      expect(result[1].id).toBe('fp2');
    });

    it('should preserve ID for updates', () => {
      const fixedPoints: FixedPointDto[] = [
        {
          id: 'existing-id',
          plan_id: 'plan1',
          location: 'Somewhere',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 60,
          description: null,
          created_at: '2024-01-15',
        },
      ];

      const result = convertFixedPointsToFormItems(fixedPoints);

      expect(result[0].id).toBe('existing-id');
    });

    it('should handle null description', () => {
      const fixedPoints: FixedPointDto[] = [
        {
          id: 'fp1',
          plan_id: 'plan1',
          location: 'Place',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 60,
          description: null,
          created_at: '2024-01-15',
        },
      ];

      const result = convertFixedPointsToFormItems(fixedPoints);

      expect(result[0].description).toBeNull();
    });

    it('should not include plan_id and created_at in form items', () => {
      const fixedPoints: FixedPointDto[] = [
        {
          id: 'fp1',
          plan_id: 'plan1',
          location: 'Place',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 60,
          description: 'Test',
          created_at: '2024-01-15',
        },
      ];

      const result = convertFixedPointsToFormItems(fixedPoints);

      expect(result[0]).not.toHaveProperty('plan_id');
      expect(result[0]).not.toHaveProperty('created_at');
    });
  });

  describe('generateDefaultPlanName', () => {
    it('should generate name from destination', () => {
      const result = generateDefaultPlanName('Paris');
      expect(result).toBe('Paris trip');
    });

    it('should generate name from destination with multiple words', () => {
      const result = generateDefaultPlanName('New York');
      expect(result).toBe('New York trip');
    });

    it('should return "New trip" for empty destination', () => {
      const result = generateDefaultPlanName('');
      expect(result).toBe('New trip');
    });

    it('should handle destination with special characters', () => {
      const result = generateDefaultPlanName('São Paulo');
      expect(result).toBe('São Paulo trip');
    });

    it('should handle destination with numbers', () => {
      const result = generateDefaultPlanName('Route 66');
      expect(result).toBe('Route 66 trip');
    });
  });
});
