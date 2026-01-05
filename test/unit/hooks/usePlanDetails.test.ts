import { describe, it, expect } from 'vitest';
import { formatActivityCommand, formatActivityUpdateCommand, formatErrorMessage } from '@/hooks/usePlanDetails';
import type { TimelineItem } from '@/types';

describe('usePlanDetails - pure functions', () => {
  describe('formatActivityCommand', () => {
    it('should convert TimelineItem to AddActivityCommand', () => {
      const activity: Partial<TimelineItem> = {
        time: '14:30',
        title: 'Visit Eiffel Tower',
        description: 'Iconic landmark',
        location: 'Champ de Mars',
        duration: 120,
        category: 'sightseeing',
        estimated_price: 25,
      };

      const result = formatActivityCommand(activity);

      expect(result).toEqual({
        time: '14:30',
        title: 'Visit Eiffel Tower',
        description: 'Iconic landmark',
        location: 'Champ de Mars',
        duration: 120,
        category: 'sightseeing',
        estimated_cost: 25,
      });
    });

    it('should provide default empty title if missing', () => {
      const activity: Partial<TimelineItem> = {
        category: 'food',
      };

      const result = formatActivityCommand(activity);

      expect(result.title).toBe('');
    });

    it('should provide default "other" category if missing', () => {
      const activity: Partial<TimelineItem> = {
        title: 'Some activity',
      };

      const result = formatActivityCommand(activity);

      expect(result.category).toBe('other');
    });

    it('should handle undefined optional fields', () => {
      const activity: Partial<TimelineItem> = {
        title: 'Museum Visit',
        category: 'culture',
      };

      const result = formatActivityCommand(activity);

      expect(result).toEqual({
        time: undefined,
        title: 'Museum Visit',
        description: undefined,
        location: undefined,
        duration: undefined,
        category: 'culture',
        estimated_cost: undefined,
      });
    });

    it('should map estimated_price to estimated_cost', () => {
      const activity: Partial<TimelineItem> = {
        title: 'Lunch',
        estimated_price: 45,
      };

      const result = formatActivityCommand(activity);

      expect(result.estimated_cost).toBe(45);
    });
  });

  describe('formatActivityUpdateCommand', () => {
    it('should convert TimelineItem to UpdateActivityCommand', () => {
      const activity: Partial<TimelineItem> = {
        time: '16:00',
        title: 'Louvre Museum',
        description: 'Art museum',
        location: 'Rue de Rivoli',
        duration: 180,
        category: 'culture',
        estimated_price: 20,
      };

      const result = formatActivityUpdateCommand(activity);

      expect(result).toEqual({
        time: '16:00',
        title: 'Louvre Museum',
        description: 'Art museum',
        location: 'Rue de Rivoli',
        duration: 180,
        category: 'culture',
        estimated_cost: 20,
      });
    });

    it('should allow undefined title (unlike formatActivityCommand)', () => {
      const activity: Partial<TimelineItem> = {
        description: 'Updated description',
      };

      const result = formatActivityUpdateCommand(activity);

      expect(result.title).toBeUndefined();
    });

    it('should allow undefined category (unlike formatActivityCommand)', () => {
      const activity: Partial<TimelineItem> = {
        title: 'Updated activity',
      };

      const result = formatActivityUpdateCommand(activity);

      expect(result.category).toBeUndefined();
    });

    it('should handle all fields undefined', () => {
      const activity: Partial<TimelineItem> = {};

      const result = formatActivityUpdateCommand(activity);

      expect(result).toEqual({
        time: undefined,
        title: undefined,
        description: undefined,
        location: undefined,
        duration: undefined,
        category: undefined,
        estimated_cost: undefined,
      });
    });

    it('should map estimated_price to estimated_cost', () => {
      const activity: Partial<TimelineItem> = {
        estimated_price: 100,
      };

      const result = formatActivityUpdateCommand(activity);

      expect(result.estimated_cost).toBe(100);
    });
  });

  describe('formatErrorMessage', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Network error occurred');
      const result = formatErrorMessage(error, 'Fallback message');

      expect(result).toBe('Network error occurred');
    });

    it('should return fallback message for non-Error', () => {
      const error = 'String error';
      const result = formatErrorMessage(error, 'Fallback message');

      expect(result).toBe('Fallback message');
    });

    it('should return fallback message for null', () => {
      const error = null;
      const result = formatErrorMessage(error, 'Fallback message');

      expect(result).toBe('Fallback message');
    });

    it('should return fallback message for undefined', () => {
      const error = undefined;
      const result = formatErrorMessage(error, 'Fallback message');

      expect(result).toBe('Fallback message');
    });

    it('should return fallback message for number', () => {
      const error = 42;
      const result = formatErrorMessage(error, 'Fallback message');

      expect(result).toBe('Fallback message');
    });

    it('should return fallback message for object', () => {
      const error = { code: 500 };
      const result = formatErrorMessage(error, 'Fallback message');

      expect(result).toBe('Fallback message');
    });
  });
});
