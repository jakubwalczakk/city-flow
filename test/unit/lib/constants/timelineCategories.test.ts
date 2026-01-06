import { describe, it, expect } from 'vitest';
import {
  TIMELINE_CATEGORIES,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryColor,
  getCategoryBgColor,
} from '@/lib/constants/timelineCategories';
import type { TimelineItemCategory } from '@/types';
import { Landmark, Utensils, Dumbbell, Trees, Palette, ArrowLeftRight, Hotel, Circle } from 'lucide-react';

describe('timelineCategories', () => {
  describe('TIMELINE_CATEGORIES constant', () => {
    it('should be defined', () => {
      expect(TIMELINE_CATEGORIES).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof TIMELINE_CATEGORIES).toBe('object');
    });

    it('should have configuration for all timeline categories', () => {
      expect(TIMELINE_CATEGORIES.history).toBeDefined();
      expect(TIMELINE_CATEGORIES.food).toBeDefined();
      expect(TIMELINE_CATEGORIES.sport).toBeDefined();
      expect(TIMELINE_CATEGORIES.nature).toBeDefined();
      expect(TIMELINE_CATEGORIES.culture).toBeDefined();
      expect(TIMELINE_CATEGORIES.transport).toBeDefined();
      expect(TIMELINE_CATEGORIES.accommodation).toBeDefined();
      expect(TIMELINE_CATEGORIES.other).toBeDefined();
    });

    it('should have correct structure for each category', () => {
      Object.values(TIMELINE_CATEGORIES).forEach((config) => {
        expect(config.icon).toBeDefined();
        expect(config.label).toBeDefined();
        expect(config.color).toBeDefined();
        expect(config.bgColor).toBeDefined();
        expect(typeof config.label).toBe('string');
        expect(typeof config.color).toBe('string');
        expect(typeof config.bgColor).toBe('string');
      });
    });

    it('should have correct icon for "history"', () => {
      expect(TIMELINE_CATEGORIES.history.icon).toBe(Landmark);
    });

    it('should have correct icon for "food"', () => {
      expect(TIMELINE_CATEGORIES.food.icon).toBe(Utensils);
    });

    it('should have correct icon for "sport"', () => {
      expect(TIMELINE_CATEGORIES.sport.icon).toBe(Dumbbell);
    });

    it('should have correct icon for "nature"', () => {
      expect(TIMELINE_CATEGORIES.nature.icon).toBe(Trees);
    });

    it('should have correct icon for "culture"', () => {
      expect(TIMELINE_CATEGORIES.culture.icon).toBe(Palette);
    });

    it('should have correct icon for "transport"', () => {
      expect(TIMELINE_CATEGORIES.transport.icon).toBe(ArrowLeftRight);
    });

    it('should have correct icon for "accommodation"', () => {
      expect(TIMELINE_CATEGORIES.accommodation.icon).toBe(Hotel);
    });

    it('should have correct icon for "other"', () => {
      expect(TIMELINE_CATEGORIES.other.icon).toBe(Circle);
    });

    it('should have Polish labels', () => {
      expect(TIMELINE_CATEGORIES.history.label).toBe('Historia');
      expect(TIMELINE_CATEGORIES.food.label).toBe('Jedzenie');
      expect(TIMELINE_CATEGORIES.sport.label).toBe('Sport');
      expect(TIMELINE_CATEGORIES.nature.label).toBe('Natura');
      expect(TIMELINE_CATEGORIES.culture.label).toBe('Kultura');
      expect(TIMELINE_CATEGORIES.transport.label).toBe('Transport');
      expect(TIMELINE_CATEGORIES.accommodation.label).toBe('Zakwaterowanie');
      expect(TIMELINE_CATEGORIES.other.label).toBe('Inne');
    });

    it('should have Tailwind color classes', () => {
      Object.values(TIMELINE_CATEGORIES).forEach((config) => {
        expect(config.color).toMatch(/^text-/);
        expect(config.bgColor).toMatch(/^bg-/);
      });
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon for "history"', () => {
      const result = getCategoryIcon('history');
      expect(result).toBe(Landmark);
    });

    it('should return correct icon for "food"', () => {
      const result = getCategoryIcon('food');
      expect(result).toBe(Utensils);
    });

    it('should return correct icon for "sport"', () => {
      const result = getCategoryIcon('sport');
      expect(result).toBe(Dumbbell);
    });

    it('should return correct icon for "nature"', () => {
      const result = getCategoryIcon('nature');
      expect(result).toBe(Trees);
    });

    it('should return correct icon for "culture"', () => {
      const result = getCategoryIcon('culture');
      expect(result).toBe(Palette);
    });

    it('should return correct icon for "transport"', () => {
      const result = getCategoryIcon('transport');
      expect(result).toBe(ArrowLeftRight);
    });

    it('should return correct icon for "accommodation"', () => {
      const result = getCategoryIcon('accommodation');
      expect(result).toBe(Hotel);
    });

    it('should return correct icon for "other"', () => {
      const result = getCategoryIcon('other');
      expect(result).toBe(Circle);
    });

    it('should return default icon for unknown category', () => {
      const result = getCategoryIcon('unknown' as TimelineItemCategory);
      expect(result).toBe(Circle);
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

    it('should return default label for unknown category', () => {
      const result = getCategoryLabel('unknown' as TimelineItemCategory);
      expect(result).toBe('Inne');
    });
  });

  describe('getCategoryColor', () => {
    it('should return correct color for "history"', () => {
      const result = getCategoryColor('history');
      expect(result).toBe('text-blue-600');
    });

    it('should return correct color for "food"', () => {
      const result = getCategoryColor('food');
      expect(result).toBe('text-orange-600');
    });

    it('should return correct color for "sport"', () => {
      const result = getCategoryColor('sport');
      expect(result).toBe('text-green-600');
    });

    it('should return correct color for "nature"', () => {
      const result = getCategoryColor('nature');
      expect(result).toBe('text-emerald-600');
    });

    it('should return correct color for "culture"', () => {
      const result = getCategoryColor('culture');
      expect(result).toBe('text-purple-600');
    });

    it('should return correct color for "transport"', () => {
      const result = getCategoryColor('transport');
      expect(result).toBe('text-gray-600');
    });

    it('should return correct color for "accommodation"', () => {
      const result = getCategoryColor('accommodation');
      expect(result).toBe('text-indigo-600');
    });

    it('should return correct color for "other"', () => {
      const result = getCategoryColor('other');
      expect(result).toBe('text-slate-600');
    });

    it('should return default color for unknown category', () => {
      const result = getCategoryColor('unknown' as TimelineItemCategory);
      expect(result).toBe('text-slate-600');
    });
  });

  describe('getCategoryBgColor', () => {
    it('should return correct background color for "history"', () => {
      const result = getCategoryBgColor('history');
      expect(result).toBe('bg-blue-50');
    });

    it('should return correct background color for "food"', () => {
      const result = getCategoryBgColor('food');
      expect(result).toBe('bg-orange-50');
    });

    it('should return correct background color for "sport"', () => {
      const result = getCategoryBgColor('sport');
      expect(result).toBe('bg-green-50');
    });

    it('should return correct background color for "nature"', () => {
      const result = getCategoryBgColor('nature');
      expect(result).toBe('bg-emerald-50');
    });

    it('should return correct background color for "culture"', () => {
      const result = getCategoryBgColor('culture');
      expect(result).toBe('bg-purple-50');
    });

    it('should return correct background color for "transport"', () => {
      const result = getCategoryBgColor('transport');
      expect(result).toBe('bg-gray-50');
    });

    it('should return correct background color for "accommodation"', () => {
      const result = getCategoryBgColor('accommodation');
      expect(result).toBe('bg-indigo-50');
    });

    it('should return correct background color for "other"', () => {
      const result = getCategoryBgColor('other');
      expect(result).toBe('bg-slate-50');
    });

    it('should return default background color for unknown category', () => {
      const result = getCategoryBgColor('unknown' as TimelineItemCategory);
      expect(result).toBe('bg-slate-50');
    });
  });
});
