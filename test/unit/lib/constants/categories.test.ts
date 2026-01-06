import { describe, it, expect } from 'vitest';
import { ACTIVITY_CATEGORIES, getCategoryLabel } from '@/lib/constants/categories';
import type { TimelineItemCategory } from '@/types';

describe('categories', () => {
  describe('ACTIVITY_CATEGORIES constant', () => {
    it('should be defined', () => {
      expect(ACTIVITY_CATEGORIES).toBeDefined();
    });

    it('should be an array', () => {
      expect(Array.isArray(ACTIVITY_CATEGORIES)).toBe(true);
    });

    it('should have 8 categories', () => {
      expect(ACTIVITY_CATEGORIES).toHaveLength(8);
    });

    it('should have expected category values', () => {
      const values = ACTIVITY_CATEGORIES.map((c) => c.value);
      expect(values).toContain('history');
      expect(values).toContain('food');
      expect(values).toContain('sport');
      expect(values).toContain('nature');
      expect(values).toContain('culture');
      expect(values).toContain('transport');
      expect(values).toContain('accommodation');
      expect(values).toContain('other');
    });

    it('should have Polish labels', () => {
      const labels = ACTIVITY_CATEGORIES.map((c) => c.label);
      expect(labels).toContain('Historia');
      expect(labels).toContain('Jedzenie');
      expect(labels).toContain('Sport');
      expect(labels).toContain('Natura');
      expect(labels).toContain('Kultura');
      expect(labels).toContain('Transport');
      expect(labels).toContain('Zakwaterowanie');
      expect(labels).toContain('Inne');
    });

    it('should have all entries with both value and label', () => {
      ACTIVITY_CATEGORIES.forEach((category) => {
        expect(category.value).toBeDefined();
        expect(category.label).toBeDefined();
        expect(typeof category.value).toBe('string');
        expect(typeof category.label).toBe('string');
      });
    });

    it('should have unique category values', () => {
      const values = ACTIVITY_CATEGORIES.map((c) => c.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('getCategoryLabel', () => {
    it('should return correct label for "history"', () => {
      const result = getCategoryLabel('history');
      expect(result).toBe('Historia');
    });

    it('should return correct label for "food"', () => {
      const result = getCategoryLabel('food');
      expect(result).toBe('Jedzenie');
    });

    it('should return correct label for "sport"', () => {
      const result = getCategoryLabel('sport');
      expect(result).toBe('Sport');
    });

    it('should return correct label for "nature"', () => {
      const result = getCategoryLabel('nature');
      expect(result).toBe('Natura');
    });

    it('should return correct label for "culture"', () => {
      const result = getCategoryLabel('culture');
      expect(result).toBe('Kultura');
    });

    it('should return correct label for "transport"', () => {
      const result = getCategoryLabel('transport');
      expect(result).toBe('Transport');
    });

    it('should return correct label for "accommodation"', () => {
      const result = getCategoryLabel('accommodation');
      expect(result).toBe('Zakwaterowanie');
    });

    it('should return correct label for "other"', () => {
      const result = getCategoryLabel('other');
      expect(result).toBe('Inne');
    });

    it('should return original value for unknown category', () => {
      const result = getCategoryLabel('unknown' as TimelineItemCategory);
      expect(result).toBe('unknown');
    });

    it('should handle empty string', () => {
      const result = getCategoryLabel('' as TimelineItemCategory);
      expect(result).toBe('');
    });
  });
});
