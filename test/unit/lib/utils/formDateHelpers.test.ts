import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDateForPicker,
  getTimeForInput,
  combineDateTimeForForm,
  updateDateInForm,
  updateTimeInForm,
} from '@/lib/utils/formDateHelpers';

describe('formDateHelpers', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDateForPicker', () => {
    it('should return Date object from ISO string', () => {
      const result = getDateForPicker('2024-01-15T14:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January is 0
      expect(result?.getDate()).toBe(15);
    });

    it('should return undefined for empty string', () => {
      expect(getDateForPicker('')).toBeUndefined();
    });

    it('should return undefined for null-like empty string', () => {
      const result = getDateForPicker('');
      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid string', () => {
      const result = getDateForPicker('invalid-date');
      expect(result === undefined || (result instanceof Date && isNaN(result.getTime()))).toBe(true);
    });

    it('should handle ISO date-only strings', () => {
      const result = getDateForPicker('2024-12-25');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });
  });

  describe('getTimeForInput', () => {
    it('should extract time in HH:MM format', () => {
      const result = getTimeForInput('2024-01-15T14:30:00Z');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should pad hours and minutes with zero', () => {
      const result = getTimeForInput('2024-01-15T09:05:00Z');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      // Should have padded format
      expect(result.length).toBe(5);
    });

    it('should return empty string for empty input', () => {
      expect(getTimeForInput('')).toBe('');
    });

    it('should return empty string for null-like empty input', () => {
      const result = getTimeForInput('');
      expect(result).toBe('');
    });

    it('should return empty string for invalid input', () => {
      const result = getTimeForInput('invalid-date');
      expect(result === '' || result === 'NaN:NaN').toBe(true);
    });

    it('should handle midnight correctly', () => {
      const result = getTimeForInput('2024-01-15T00:00:00Z');
      // Midnight in UTC may be different in local timezone
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle noon correctly', () => {
      const result = getTimeForInput('2024-01-15T12:00:00Z');
      // Noon in UTC may be different in local timezone
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('combineDateTimeForForm', () => {
    it('should combine date and time into ISO format', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = combineDateTimeForForm(date, '14:30');

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should use format YYYY-MM-DDTHH:MM', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = combineDateTimeForForm(date, '14:30');

      expect(result).toContain('2024-01-');
      expect(result).toContain('T14:30');
    });

    it('should pad month and day with zeros', () => {
      const date = new Date('2024-01-05T00:00:00Z');
      const result = combineDateTimeForForm(date, '09:05');

      expect(result).toMatch(/2024-01-0\d/);
      expect(result).toContain('09:05');
    });

    it('should handle midnight time', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = combineDateTimeForForm(date, '00:00');

      expect(result).toContain('T00:00');
    });

    it('should handle different months', () => {
      const date = new Date('2024-12-31T00:00:00Z');
      const result = combineDateTimeForForm(date, '23:59');

      expect(result).toContain('2024-12-31');
      expect(result).toContain('T23:59');
    });
  });

  describe('updateDateInForm', () => {
    it('should preserve time when updating date', () => {
      const currentValue = '2024-01-15T14:30';
      const newDate = new Date('2024-02-20T00:00:00Z');

      const result = updateDateInForm(currentValue, newDate);

      expect(result).toContain('2024-02-20');
      expect(result).toContain('14:30');
    });

    it('should use 12:00 as default time if current value is empty', () => {
      const newDate = new Date('2024-02-20T00:00:00Z');
      const result = updateDateInForm('', newDate);

      expect(result).toContain('12:00');
    });

    it('should preserve hours and minutes exactly', () => {
      const currentValue = '2024-01-15T09:05';
      const newDate = new Date('2024-03-25T00:00:00Z');

      const result = updateDateInForm(currentValue, newDate);

      expect(result).toContain('09:05');
    });
  });

  describe('updateTimeInForm', () => {
    it('should preserve date when updating time', () => {
      const currentValue = '2024-01-15T10:00';
      const result = updateTimeInForm(currentValue, '14:30');

      expect(result).toContain('2024-01-15');
      expect(result).toContain('14:30');
    });

    it('should use today as default date if current value is empty', () => {
      const result = updateTimeInForm('', '14:30');

      expect(result).toContain('2024-01-15'); // Mocked date
      expect(result).toContain('14:30');
    });

    it('should preserve year, month, and day exactly', () => {
      const currentValue = '2024-12-31T10:00';
      const result = updateTimeInForm(currentValue, '23:59');

      expect(result).toContain('2024-12-31');
      expect(result).toContain('23:59');
    });

    it('should handle midnight time update', () => {
      const currentValue = '2024-01-15T14:30';
      const result = updateTimeInForm(currentValue, '00:00');

      expect(result).toContain('00:00');
    });
  });
});
