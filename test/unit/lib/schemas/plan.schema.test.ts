import { describe, it, expect } from 'vitest';
import {
  planSchema,
  createPlanSchema,
  listPlansQuerySchema,
  basicInfoSchema,
  fixedPointSchema,
  updatePlanSchema,
} from '@/lib/schemas/plan.schema';

describe('plan.schema', () => {
  describe('planSchema', () => {
    it('should accept valid plan data', () => {
      const data = {
        name: 'Paris Trip',
        destination: 'Paris, France',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
        notes: 'Spring break trip',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const data = {
        destination: 'Paris',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional notes', () => {
      const data = {
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('createPlanSchema', () => {
    it('should validate plan with end_date after start_date', () => {
      const data = {
        name: 'London Trip',
        destination: 'London',
        start_date: '2024-03-01T09:00:00Z',
        end_date: '2024-03-05T18:00:00Z',
      };

      const result = createPlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow end_date equal to start_date', () => {
      const data = {
        name: 'Day Trip',
        destination: 'Rome',
        start_date: '2024-03-10T09:00:00Z',
        end_date: '2024-03-10T18:00:00Z',
      };

      const result = createPlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject end_date before start_date', () => {
      const data = {
        name: 'Invalid Trip',
        destination: 'Barcelona',
        start_date: '2024-03-20T09:00:00Z',
        end_date: '2024-03-15T18:00:00Z',
      };

      const result = createPlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('listPlansQuerySchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        statuses: ['draft', 'generated'],
        sort_by: 'created_at',
        order: 'desc',
        limit: 20,
        offset: 0,
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const data = {};

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_by).toBe('created_at');
        expect(result.data.order).toBe('desc');
        expect(result.data.limit).toBe(20);
      }
    });

    it('should accept string statuses and convert to array', () => {
      const data = {
        statuses: 'draft',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should split comma-separated statuses', () => {
      const data = {
        statuses: 'draft,generated,archived',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status values', () => {
      const data = {
        statuses: ['invalid_status'],
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate limit constraints', () => {
      const data = { limit: 0 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept limit up to 100', () => {
      const data = { limit: 100 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('basicInfoSchema', () => {
    it('should validate valid basic info', () => {
      const data = {
        name: 'Trip Name',
        destination: 'Destination',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-07'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const data = {
        name: '',
        destination: 'Destination',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-07'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject end_date before start_date', () => {
      const data = {
        name: 'Trip',
        destination: 'Dest',
        start_date: new Date('2024-02-10'),
        end_date: new Date('2024-02-05'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('fixedPointSchema', () => {
    it('should validate valid fixed point', () => {
      const data = {
        location: 'Hotel Paris',
        event_at: '2024-02-01T14:00:00Z',
        event_duration: 120,
        description: 'Check-in',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow null duration', () => {
      const data = {
        location: 'Museum',
        event_at: '2024-02-02T10:00:00Z',
        event_duration: null,
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative duration', () => {
      const data = {
        location: 'Restaurant',
        event_at: '2024-02-02T18:00:00Z',
        event_duration: -60,
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePlanSchema', () => {
    it('should allow partial updates', () => {
      const data = {
        name: 'Updated Name',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow status updates', () => {
      const data = {
        status: 'generated',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate date order when both dates provided', () => {
      const data = {
        start_date: '2024-02-10T09:00:00Z',
        end_date: '2024-02-05T18:00:00Z',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow empty object', () => {
      const data = {};

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
