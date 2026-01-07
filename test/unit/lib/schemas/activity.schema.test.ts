import { describe, it, expect } from 'vitest';
import { activitySchema, transformActivityFormData, type ActivityFormData } from '@/lib/schemas/activity.schema';

describe('activity.schema', () => {
  describe('activitySchema - valid data', () => {
    it('should accept valid activity with all fields', () => {
      const data = {
        title: 'Visit Eiffel Tower',
        time: '14:30',
        category: 'culture' as const,
        location: 'Paris, France',
        description: 'Visit the famous Eiffel Tower',
        estimated_price: '25 EUR',
        estimated_duration: '120',
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept valid activity with required fields only', () => {
      const data = {
        title: 'Lunch',
        category: 'food' as const,
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all valid categories', () => {
      const categories = ['history', 'food', 'sport', 'nature', 'culture', 'transport', 'accommodation', 'other'];

      categories.forEach((category) => {
        const data = {
          title: 'Test Activity',
          category,
        };

        const result = activitySchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept empty strings for optional fields', () => {
      const data = {
        title: 'Test',
        category: 'other' as const,
        time: '',
        location: '',
        description: '',
        estimated_price: '',
        estimated_duration: '',
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept valid time formats', () => {
      const times = ['00:00', '09:30', '12:00', '23:59'];

      times.forEach((time) => {
        const data = {
          title: 'Test',
          category: 'other' as const,
          time,
        };

        const result = activitySchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('activitySchema - validation errors', () => {
    it('should reject missing title', () => {
      const data = {
        category: 'other' as const,
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title');
      }
    });

    it('should reject empty title', () => {
      const data = {
        title: '',
        category: 'other' as const,
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('wymagany');
      }
    });

    it('should reject title longer than 200 characters', () => {
      const data = {
        title: 'a'.repeat(201),
        category: 'other' as const,
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200');
      }
    });

    it('should reject missing category', () => {
      const data = {
        title: 'Test',
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('category');
        // Zod 4 returns "Invalid option" for missing enum fields
        expect(result.error.issues[0].message).toMatch(/Invalid option|wymagana/);
      }
    });

    it('should reject invalid category', () => {
      const data = {
        title: 'Test',
        category: 'invalid-category',
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidTimes = ['24:00', '25:00', '12:60', '1:30', '12:5', 'abc'];

      invalidTimes.forEach((time) => {
        const data = {
          title: 'Test',
          category: 'other' as const,
          time,
        };

        const result = activitySchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should reject location longer than 200 characters', () => {
      const data = {
        title: 'Test',
        category: 'other' as const,
        location: 'a'.repeat(201),
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200');
      }
    });

    it('should reject description longer than 1000 characters', () => {
      const data = {
        title: 'Test',
        category: 'other' as const,
        description: 'a'.repeat(1001),
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1000');
      }
    });

    it('should reject estimated_price longer than 50 characters', () => {
      const data = {
        title: 'Test',
        category: 'other' as const,
        estimated_price: 'a'.repeat(51),
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('50');
      }
    });

    it('should reject non-numeric estimated_duration', () => {
      const data = {
        title: 'Test',
        category: 'other' as const,
        estimated_duration: 'abc',
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('liczbę');
      }
    });

    it('should reject estimated_duration with decimal', () => {
      const data = {
        title: 'Test',
        category: 'other' as const,
        estimated_duration: '12.5',
      };

      const result = activitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('transformActivityFormData', () => {
    it('should transform complete form data correctly', () => {
      const formData: ActivityFormData = {
        title: 'Visit Museum',
        time: '14:30',
        category: 'culture',
        location: 'Downtown',
        description: 'Great museum',
        estimated_price: '20 EUR',
        estimated_duration: '90',
      };

      const result = transformActivityFormData(formData);

      expect(result).toEqual({
        title: 'Visit Museum',
        time: '14:30',
        category: 'culture',
        location: 'Downtown',
        description: 'Great museum',
        estimated_price: '20 EUR',
        estimated_duration: '90 min',
        duration: 90,
      });
    });

    it('should transform empty strings to undefined', () => {
      const formData: ActivityFormData = {
        title: 'Test',
        category: 'other',
        time: '',
        location: '',
        description: '',
        estimated_price: '',
        estimated_duration: '',
      };

      const result = transformActivityFormData(formData);

      expect(result.time).toBeUndefined();
      expect(result.location).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.estimated_price).toBeUndefined();
      expect(result.estimated_duration).toBeUndefined();
      expect(result.duration).toBeUndefined();
    });

    it('should handle missing optional fields', () => {
      const formData: ActivityFormData = {
        title: 'Test',
        category: 'food',
      };

      const result = transformActivityFormData(formData);

      expect(result.title).toBe('Test');
      expect(result.category).toBe('food');
      expect(result.time).toBeUndefined();
      expect(result.location).toBeUndefined();
    });

    it('should convert duration to number and add " min" suffix', () => {
      const formData: ActivityFormData = {
        title: 'Test',
        category: 'sport',
        estimated_duration: '45',
      };

      const result = transformActivityFormData(formData);

      expect(result.estimated_duration).toBe('45 min');
      expect(result.duration).toBe(45);
      expect(typeof result.duration).toBe('number');
    });

    it('should handle zero duration', () => {
      const formData: ActivityFormData = {
        title: 'Test',
        category: 'other',
        estimated_duration: '0',
      };

      const result = transformActivityFormData(formData);

      expect(result.estimated_duration).toBe('0 min');
      expect(result.duration).toBe(0);
    });
  });
});
