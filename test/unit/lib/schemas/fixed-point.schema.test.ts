import { describe, it, expect } from 'vitest';
import { createFixedPointSchema, updateFixedPointSchema } from '@/lib/schemas/fixed-point.schema';

describe('fixed-point.schema', () => {
  describe('createFixedPointSchema - valid data', () => {
    it('should accept valid fixed point with all fields', () => {
      const data = {
        location: 'Airport Terminal 1',
        event_at: '2024-01-15T10:00:00.000Z',
        event_duration: 60,
        description: 'Flight arrival',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept fixed point without optional fields', () => {
      const data = {
        location: 'Hotel Check-in',
        event_at: '2024-01-15T14:00:00.000Z',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept null event_duration', () => {
      const data = {
        location: 'Meeting Point',
        event_at: '2024-01-15T12:00:00.000Z',
        event_duration: null,
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept null description', () => {
      const data = {
        location: 'Station',
        event_at: '2024-01-15T08:00:00.000Z',
        description: null,
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should transform empty string event_duration to null', () => {
      const data = {
        location: 'Test Location',
        event_at: '2024-01-15T10:00:00.000Z',
        event_duration: '',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event_duration).toBeNull();
      }
    });

    it('should transform zero event_duration to null', () => {
      const data = {
        location: 'Test Location',
        event_at: '2024-01-15T10:00:00.000Z',
        event_duration: 0,
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event_duration).toBeNull();
      }
    });

    it('should accept various ISO datetime formats', () => {
      const datetimes = ['2024-01-15T10:00:00.000Z', '2024-12-31T23:59:59.999Z', '2024-06-15T14:30:00.000Z'];

      datetimes.forEach((event_at) => {
        const data = {
          location: 'Test',
          event_at,
        };

        const result = createFixedPointSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('createFixedPointSchema - validation errors', () => {
    it('should reject missing location', () => {
      const data = {
        event_at: '2024-01-15T10:00:00.000Z',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('location');
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject empty location', () => {
      const data = {
        location: '',
        event_at: '2024-01-15T10:00:00.000Z',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('empty');
      }
    });

    it('should reject missing event_at', () => {
      const data = {
        location: 'Airport',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('event_at');
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject invalid datetime format', () => {
      const invalidDatetimes = ['2024-01-15', '10:00:00', 'not-a-date', '2024/01/15 10:00:00'];

      invalidDatetimes.forEach((event_at) => {
        const data = {
          location: 'Test',
          event_at,
        };

        const result = createFixedPointSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should reject negative event_duration', () => {
      const data = {
        location: 'Test',
        event_at: '2024-01-15T10:00:00.000Z',
        event_duration: -30,
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject decimal event_duration', () => {
      const data = {
        location: 'Test',
        event_at: '2024-01-15T10:00:00.000Z',
        event_duration: 30.5,
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('integer');
      }
    });

    it('should reject string event_duration', () => {
      const data = {
        location: 'Test',
        event_at: '2024-01-15T10:00:00.000Z',
        event_duration: 'thirty',
      };

      const result = createFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });
  });

  describe('updateFixedPointSchema - valid data', () => {
    it('should accept partial update with location only', () => {
      const data = {
        location: 'New Location',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial update with event_at only', () => {
      const data = {
        event_at: '2024-01-20T15:00:00.000Z',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial update with event_duration only', () => {
      const data = {
        event_duration: 90,
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial update with description only', () => {
      const data = {
        description: 'Updated description',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept update with all fields', () => {
      const data = {
        location: 'Updated Location',
        event_at: '2024-01-20T16:00:00.000Z',
        event_duration: 120,
        description: 'Updated description',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const data = {};

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should transform empty string event_duration to null', () => {
      const data = {
        event_duration: '',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event_duration).toBeNull();
      }
    });

    it('should transform zero event_duration to null', () => {
      const data = {
        event_duration: 0,
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event_duration).toBeNull();
      }
    });
  });

  describe('updateFixedPointSchema - validation errors', () => {
    it('should reject empty location', () => {
      const data = {
        location: '',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('empty');
      }
    });

    it('should reject invalid datetime format', () => {
      const data = {
        event_at: 'invalid-date',
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative event_duration', () => {
      const data = {
        event_duration: -60,
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject decimal event_duration', () => {
      const data = {
        event_duration: 45.5,
      };

      const result = updateFixedPointSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
