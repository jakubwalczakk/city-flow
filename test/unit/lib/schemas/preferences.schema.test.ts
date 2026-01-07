import { describe, it, expect } from 'vitest';
import { preferencesSchema } from '@/lib/schemas/preferences.schema';

describe('preferences.schema', () => {
  describe('preferencesSchema - valid data', () => {
    it('should accept valid preferences with 2 items', () => {
      const data = {
        preferences: ['Art & Museums', 'Local Food'],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept valid preferences with 5 items', () => {
      const data = {
        preferences: ['Art & Museums', 'Local Food', 'Nightlife', 'Nature', 'Shopping'],
        travel_pace: 'intensive' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept valid preferences with 3 items', () => {
      const data = {
        preferences: ['History', 'Culture', 'Sports'],
        travel_pace: 'slow' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all valid travel_pace values', () => {
      const paces: ('slow' | 'moderate' | 'intensive')[] = ['slow', 'moderate', 'intensive'];

      paces.forEach((pace) => {
        const data = {
          preferences: ['Test 1', 'Test 2'],
          travel_pace: pace,
        };

        const result = preferencesSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept preferences with special characters', () => {
      const data = {
        preferences: ['Art & Museums', 'Food & Drinks'],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept preferences with unicode characters', () => {
      const data = {
        preferences: ['Sztuka i Muzea', 'Lokalne Jedzenie'],
        travel_pace: 'slow' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('preferencesSchema - validation errors', () => {
    it('should reject missing preferences', () => {
      const data = {
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('preferences');
      }
    });

    it('should reject preferences with only 1 item', () => {
      const data = {
        preferences: ['Art & Museums'],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2');
      }
    });

    it('should reject preferences with 0 items', () => {
      const data = {
        preferences: [],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2');
      }
    });

    it('should reject preferences with more than 5 items', () => {
      const data = {
        preferences: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('5');
      }
    });

    it('should reject missing travel_pace', () => {
      const data = {
        preferences: ['Art & Museums', 'Local Food'],
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('travel_pace');
        // Zod 4 returns "Invalid option" for missing enum fields
        expect(result.error.issues[0].message).toMatch(/Invalid option|Wybierz tempo/);
      }
    });

    it('should reject invalid travel_pace value', () => {
      const data = {
        preferences: ['Art & Museums', 'Local Food'],
        travel_pace: 'fast',
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty string travel_pace', () => {
      const data = {
        preferences: ['Art & Museums', 'Local Food'],
        travel_pace: '',
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-array preferences', () => {
      const data = {
        preferences: 'Art & Museums, Local Food',
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject preferences with non-string items', () => {
      const data = {
        preferences: [1, 2, 3],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('preferencesSchema - edge cases', () => {
    it('should accept preferences with empty strings (if 2-5 items)', () => {
      const data = {
        preferences: ['', ''],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept preferences with very long strings', () => {
      const data = {
        preferences: ['a'.repeat(1000), 'b'.repeat(1000)],
        travel_pace: 'slow' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept duplicate preferences', () => {
      const data = {
        preferences: ['Art & Museums', 'Art & Museums'],
        travel_pace: 'moderate' as const,
      };

      const result = preferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
