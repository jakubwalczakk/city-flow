import { describe, it, expect } from 'vitest';
import { updateProfileSchema } from '@/lib/schemas/profile.schema';

describe('profile.schema', () => {
  describe('updateProfileSchema - valid data', () => {
    it('should accept full profile update', () => {
      const data = {
        preferences: ['Art & Museums', 'Local Food', 'Nightlife'],
        travel_pace: 'intensive' as const,
        onboarding_completed: true,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial update - preferences only', () => {
      const data = {
        preferences: ['History', 'Culture'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial update - travel_pace only', () => {
      const data = {
        travel_pace: 'slow' as const,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial update - onboarding_completed only', () => {
      const data = {
        onboarding_completed: true,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const data = {};

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all valid travel_pace values', () => {
      const paces: ('slow' | 'moderate' | 'intensive')[] = ['slow', 'moderate', 'intensive'];

      paces.forEach((pace) => {
        const data = {
          travel_pace: pace,
        };

        const result = updateProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept preferences with 2 items', () => {
      const data = {
        preferences: ['Item 1', 'Item 2'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept preferences with 5 items', () => {
      const data = {
        preferences: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept onboarding_completed as false', () => {
      const data = {
        onboarding_completed: false,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept combination of fields', () => {
      const data = {
        preferences: ['Nature', 'Sports'],
        travel_pace: 'moderate' as const,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema - validation errors', () => {
    it('should reject preferences with only 1 item', () => {
      const data = {
        preferences: ['Single Item'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2');
      }
    });

    it('should reject preferences with 0 items', () => {
      const data = {
        preferences: [],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2');
      }
    });

    it('should reject preferences with more than 5 items', () => {
      const data = {
        preferences: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('5');
      }
    });

    it('should reject invalid travel_pace value', () => {
      const data = {
        travel_pace: 'fast',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty string travel_pace', () => {
      const data = {
        travel_pace: '',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean onboarding_completed', () => {
      const data = {
        onboarding_completed: 'true',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-array preferences', () => {
      const data = {
        preferences: 'Art & Museums, Local Food',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject preferences with non-string items', () => {
      const data = {
        preferences: [1, 2, 3],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject numeric onboarding_completed', () => {
      const data = {
        onboarding_completed: 1,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema - edge cases', () => {
    it('should accept preferences with empty strings', () => {
      const data = {
        preferences: ['', ''],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept preferences with very long strings', () => {
      const data = {
        preferences: ['a'.repeat(1000), 'b'.repeat(1000)],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept duplicate preferences', () => {
      const data = {
        preferences: ['Art & Museums', 'Art & Museums'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept preferences with special characters', () => {
      const data = {
        preferences: ['Art & Museums', 'Food & Drinks'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept preferences with unicode characters', () => {
      const data = {
        preferences: ['Sztuka i Muzea', 'Lokalne Jedzenie'],
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all fields as undefined', () => {
      const data = {
        preferences: undefined,
        travel_pace: undefined,
        onboarding_completed: undefined,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
