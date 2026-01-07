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

    it('should reject empty name', () => {
      const data = {
        name: '',
        destination: 'Paris',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing destination', () => {
      const data = {
        name: 'Trip',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty destination', () => {
      const data = {
        name: 'Trip',
        destination: '',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid start_date format', () => {
      const data = {
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-02-01',
        end_date: '2024-02-07T18:00:00Z',
      };

      const result = planSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid end_date format', () => {
      const data = {
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-02-01T09:00:00Z',
        end_date: 'invalid',
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

    it('should allow null notes', () => {
      const data = {
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-02-01T09:00:00Z',
        end_date: '2024-02-07T18:00:00Z',
        notes: null,
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

    it('should require all base fields', () => {
      const data = {
        name: 'Trip',
        destination: 'Place',
        start_date: '2024-03-01T09:00:00Z',
      };

      const result = createPlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional notes in createPlanSchema', () => {
      const data = {
        name: 'Trip',
        destination: 'Place',
        start_date: '2024-03-01T09:00:00Z',
        end_date: '2024-03-05T18:00:00Z',
        notes: 'Some notes',
      };

      const result = createPlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow null notes in createPlanSchema', () => {
      const data = {
        name: 'Trip',
        destination: 'Place',
        start_date: '2024-03-01T09:00:00Z',
        end_date: '2024-03-05T18:00:00Z',
        notes: null,
      };

      const result = createPlanSchema.safeParse(data);
      expect(result.success).toBe(true);
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
        expect(result.data.offset).toBe(0);
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

    it('should trim whitespace in comma-separated statuses', () => {
      const data = {
        statuses: 'draft , generated , archived',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.statuses).toEqual(['draft', 'generated', 'archived']);
      }
    });

    it('should handle null statuses', () => {
      const data = {
        statuses: null,
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

    it('should accept sort_by "name"', () => {
      const data = {
        sort_by: 'name',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_by).toBe('name');
      }
    });

    it('should accept sort_by "created_at"', () => {
      const data = {
        sort_by: 'created_at',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_by).toBe('created_at');
      }
    });

    it('should reject invalid sort_by', () => {
      const data = {
        sort_by: 'invalid_field',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept order "asc"', () => {
      const data = {
        order: 'asc',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order).toBe('asc');
      }
    });

    it('should reject invalid order', () => {
      const data = {
        order: 'invalid_order',
      };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate limit constraints - minimum', () => {
      const data = { limit: 0 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate limit constraints - maximum', () => {
      const data = { limit: 101 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept limit up to 100', () => {
      const data = { limit: 100 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should coerce string limit to number', () => {
      const data = { limit: '25' };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it('should validate offset constraints', () => {
      const data = { offset: -1 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept valid offset', () => {
      const data = { offset: 50 };

      const result = listPlansQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offset).toBe(50);
      }
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

    it('should require destination', () => {
      const data = {
        name: 'Trip',
        destination: '',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-07'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require start_date', () => {
      const data = {
        name: 'Trip',
        destination: 'Destination',
        end_date: new Date('2024-02-07'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require end_date', () => {
      const data = {
        name: 'Trip',
        destination: 'Destination',
        start_date: new Date('2024-02-01'),
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

    it('should allow end_date equal to start_date', () => {
      const data = {
        name: 'Day Trip',
        destination: 'Destination',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-01'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional notes', () => {
      const data = {
        name: 'Trip',
        destination: 'Destination',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-07'),
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow null notes', () => {
      const data = {
        name: 'Trip',
        destination: 'Destination',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-07'),
        notes: null,
      };

      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(true);
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

    it('should require location', () => {
      const data = {
        location: '',
        event_at: '2024-02-01T14:00:00Z',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require event_at', () => {
      const data = {
        location: 'Hotel',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid event_at format', () => {
      const data = {
        location: 'Hotel',
        event_at: '2024-02-01',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
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

    it('should allow optional duration', () => {
      const data = {
        location: 'Museum',
        event_at: '2024-02-02T10:00:00Z',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept positive duration', () => {
      const data = {
        location: 'Restaurant',
        event_at: '2024-02-02T18:00:00Z',
        event_duration: 60,
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject zero duration', () => {
      const data = {
        location: 'Restaurant',
        event_at: '2024-02-02T18:00:00Z',
        event_duration: 0,
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
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

    it('should reject non-integer duration', () => {
      const data = {
        location: 'Restaurant',
        event_at: '2024-02-02T18:00:00Z',
        event_duration: 60.5,
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional description', () => {
      const data = {
        location: 'Hotel',
        event_at: '2024-02-01T14:00:00Z',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow null description', () => {
      const data = {
        location: 'Hotel',
        event_at: '2024-02-01T14:00:00Z',
        description: null,
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow description with special characters', () => {
      const data = {
        location: 'Hotel',
        event_at: '2024-02-01T14:00:00Z',
        description: 'Check-in & dinner @ restaurant',
      };

      const result = fixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
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

    it('should allow partial updates - destination only', () => {
      const data = {
        destination: 'New Destination',
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

    it('should accept all status values', () => {
      const statuses = ['draft', 'generated', 'archived'];
      statuses.forEach((status) => {
        const result = updatePlanSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const data = {
        status: 'invalid_status',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate date order when both dates provided', () => {
      const data = {
        start_date: '2024-02-10T09:00:00Z',
        end_date: '2024-02-05T18:00:00Z',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow equal dates when both provided', () => {
      const data = {
        start_date: '2024-02-10T09:00:00Z',
        end_date: '2024-02-10T18:00:00Z',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow valid date order when both dates provided', () => {
      const data = {
        start_date: '2024-02-05T09:00:00Z',
        end_date: '2024-02-10T18:00:00Z',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should skip date validation if only start_date provided', () => {
      const data = {
        start_date: '2024-02-10T09:00:00Z',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should skip date validation if only end_date provided', () => {
      const data = {
        end_date: '2024-02-10T09:00:00Z',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const data = {};

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow notes update', () => {
      const data = {
        notes: 'Updated notes',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow null notes', () => {
      const data = {
        notes: null,
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid start_date format', () => {
      const data = {
        start_date: '2024-02-10',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid end_date format', () => {
      const data = {
        end_date: 'invalid',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow multiple fields update', () => {
      const data = {
        name: 'Updated Name',
        destination: 'New Destination',
        status: 'generated',
        notes: 'Updated notes',
      };

      const result = updatePlanSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    describe('plan schema - special character handling', () => {
      it('should accept names with special characters', () => {
        const data = {
          name: "Trip to Paris & London's Amazing Adventure!",
          destination: 'Europe - France, UK',
          start_date: '2024-02-01T09:00:00Z',
          end_date: '2024-02-07T18:00:00Z',
        };

        const result = planSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept very long names', () => {
        const longName = 'A'.repeat(200);
        const data = {
          name: longName,
          destination: 'Paris',
          start_date: '2024-02-01T09:00:00Z',
          end_date: '2024-02-07T18:00:00Z',
        };

        const result = planSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept destinations with multiple levels', () => {
        const data = {
          name: 'Trip',
          destination: 'Europe - France - Paris - 9th Arrondissement',
          start_date: '2024-02-01T09:00:00Z',
          end_date: '2024-02-07T18:00:00Z',
        };

        const result = planSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('basicInfoSchema - date boundary conditions', () => {
      it('should accept dates on year boundaries', () => {
        const data = {
          name: 'New Year Trip',
          destination: 'Destination',
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-12-31'),
        };

        const result = basicInfoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept dates at month boundaries', () => {
        const data = {
          name: 'Month Trip',
          destination: 'Destination',
          start_date: new Date('2024-02-01'),
          end_date: new Date('2024-02-29'),
        };

        const result = basicInfoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should handle leap year dates', () => {
        const data = {
          name: 'Leap Year Trip',
          destination: 'Destination',
          start_date: new Date('2024-02-28'),
          end_date: new Date('2024-02-29'),
        };

        const result = basicInfoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('fixedPointSchema - numerical edge cases', () => {
      it('should accept very large duration values', () => {
        const data = {
          location: 'Long Event',
          event_at: '2024-02-01T14:00:00Z',
          event_duration: 999999,
        };

        const result = fixedPointSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should reject decimal duration values', () => {
        const data = {
          location: 'Event',
          event_at: '2024-02-01T14:00:00Z',
          event_duration: 30.5,
        };

        const result = fixedPointSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should accept duration of 1 (minimum positive)', () => {
        const data = {
          location: 'Quick Event',
          event_at: '2024-02-01T14:00:00Z',
          event_duration: 1,
        };

        const result = fixedPointSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('listPlansQuerySchema - pagination edge cases', () => {
      it('should accept maximum valid limit', () => {
        const data = { limit: 100 };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(100);
        }
      });

      it('should accept minimum valid limit', () => {
        const data = { limit: 1 };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(1);
        }
      });

      it('should handle large offset values', () => {
        const data = { offset: 10000 };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.offset).toBe(10000);
        }
      });

      it('should handle string offset conversion', () => {
        const data = { offset: '50' };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.offset).toBe(50);
        }
      });

      it('should handle mixed comma and array statuses', () => {
        const data = {
          statuses: 'draft,generated',
        };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.statuses).toEqual(['draft', 'generated']);
        }
      });

      it('should handle empty array statuses', () => {
        const data = {
          statuses: [],
        };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('Schema error message accuracy', () => {
      it('should provide correct Polish error message for empty name', () => {
        const data = {
          name: '',
          destination: 'Paris',
          start_date: '2024-02-01T09:00:00Z',
          end_date: '2024-02-07T18:00:00Z',
        };

        const result = planSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('nie może być pusta');
        }
      });

      it('should provide error for invalid datetime format', () => {
        const data = {
          name: 'Trip',
          destination: 'Paris',
          start_date: 'not-a-date',
          end_date: '2024-02-07T18:00:00Z',
        };

        const result = planSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe('Type coercion and preprocessing', () => {
      it('should coerce string limit to number in listPlansQuerySchema', () => {
        const data = { limit: '50', offset: '10' };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data.limit).toBe('number');
          expect(typeof result.data.offset).toBe('number');
        }
      });

      it('should handle string to number coercion for invalid values', () => {
        const data = { limit: 'invalid' };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should preprocess empty string as undefined in statuses', () => {
        const data = {
          statuses: '',
        };

        const result = listPlansQuerySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.statuses).toBeUndefined();
        }
      });
    });
  });
});
