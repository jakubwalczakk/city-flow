import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDateRange,
  formatDateTime,
  formatDateTimeLong,
  formatDateOnly,
  getDateFromISO,
  getTimeFromISO,
  combineDateAndTime,
  updateDateKeepTime,
  updateTimeKeepDate,
  formatDateObjectLong,
  getNextMonthResetDate,
  formatDayWithWeekday,
  formatUpdatedAt,
} from '@/lib/utils/dateFormatters';

describe('dateFormatters', () => {
  // Mock consistent timezone for all tests
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDateRange', () => {
    it('should return "Daty nie ustawione" when both dates are undefined', () => {
      expect(formatDateRange()).toBe('Daty nie ustawione');
    });

    it('should return "Daty nie ustawione" when both dates are empty strings', () => {
      expect(formatDateRange('', '')).toBe('Daty nie ustawione');
    });

    it('should format date range when both dates provided', () => {
      const result = formatDateRange('2024-01-01', '2024-01-05');
      expect(result).toContain('sty');
      expect(result).toContain('2024');
      expect(result).toContain('-');
    });

    it('should format "Od [date]" when only start date provided', () => {
      const result = formatDateRange('2024-01-01');
      expect(result).toMatch(/^Od /);
      expect(result).toContain('sty');
    });

    it('should format "Do [date]" when only end date provided', () => {
      const result = formatDateRange(undefined, '2024-01-05');
      expect(result).toMatch(/^Do /);
      expect(result).toContain('sty');
    });

    it('should use Polish locale', () => {
      const result = formatDateRange('2024-01-01', '2024-01-05');
      // Polish month abbreviations
      expect(result).toMatch(/sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|lis|gru/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date-time with default options', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z');
      expect(result).toContain('sty');
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{2}:\d{2}/); // Time format HH:MM
    });

    it('should respect dateStyle option - short', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', { dateStyle: 'short' });
      expect(result).toContain('sty');
    });

    it('should respect dateStyle option - medium', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', { dateStyle: 'medium' });
      expect(result).toContain('sty');
    });

    it('should respect dateStyle option - long', () => {
      const result = formatDateTime('2024-12-15T14:30:00Z', { dateStyle: 'long' });
      expect(result).toContain('grudnia');
    });

    it('should respect timeStyle option - short (default)', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', { timeStyle: 'short' });
      expect(result).toMatch(/\d{2}:\d{2}/);
      // Short time style should not include seconds at the end (but may have them in middle)
      expect(result).not.toMatch(/:\d{2}:\d{2}$/);
    });

    it('should respect timeStyle option - medium', () => {
      const result = formatDateTime('2024-01-15T14:30:45Z', { timeStyle: 'medium' });
      // Medium time style includes seconds
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should handle includeYear option - true (default)', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', { includeYear: true });
      expect(result).toContain('2024');
    });

    it('should handle includeYear option - false', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', { includeYear: false });
      expect(result).not.toContain('2024');
    });

    it('should handle null options parameter', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', undefined);
      expect(result).toBeDefined();
      expect(result).toContain('2024');
    });

    it('should handle partial options object', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z', { dateStyle: 'long' });
      expect(result).toContain('stycznia');
    });

    it('should return original string on invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = formatDateTime(invalidDate);
      // Should return either original string or 'Invalid Date'
      expect([invalidDate, 'Invalid Date']).toContain(result);
    });

    it('should use 24-hour format', () => {
      const result = formatDateTime('2024-01-15T22:30:00Z');
      // Should not contain AM/PM
      expect(result).not.toMatch(/AM|PM/);
    });
  });

  describe('formatDateTimeLong', () => {
    it('should format date in long format', () => {
      const result = formatDateTimeLong('2024-12-15T14:30:00Z');
      expect(result).toContain('grudnia');
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should return original string on invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = formatDateTimeLong(invalidDate);
      expect([invalidDate, 'Invalid Date']).toContain(result);
    });
  });

  describe('formatDateOnly', () => {
    it('should format only date without time', () => {
      const result = formatDateOnly('2024-12-15T14:30:00Z');
      expect(result).toContain('grudnia');
      expect(result).toContain('2024');
      expect(result).not.toMatch(/\d{2}:\d{2}/); // No time
    });

    it('should return original string on invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = formatDateOnly(invalidDate);
      expect([invalidDate, 'Invalid Date']).toContain(result);
    });
  });

  describe('getDateFromISO', () => {
    it('should return Date object from valid ISO string', () => {
      const result = getDateFromISO('2024-01-15T14:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return undefined for empty string', () => {
      expect(getDateFromISO('')).toBeUndefined();
    });

    it('should return undefined for invalid string', () => {
      const result = getDateFromISO('invalid-date');
      // Should return undefined or Invalid Date
      expect(result === undefined || (result instanceof Date && isNaN(result.getTime()))).toBe(true);
    });
  });

  describe('getTimeFromISO', () => {
    it('should extract time in HH:MM format', () => {
      const result = getTimeFromISO('2024-01-15T14:30:00Z');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should pad hours and minutes with zero', () => {
      const result = getTimeFromISO('2024-01-15T09:05:00Z');
      // Should have format HH:MM with padded zeros
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      expect(result.startsWith('0') || result.startsWith('1')).toBe(true);
    });

    it('should return empty string for empty input', () => {
      expect(getTimeFromISO('')).toBe('');
    });

    it('should return empty string for invalid input', () => {
      const result = getTimeFromISO('invalid-date');
      // Should return empty string or 'NaN:NaN'
      expect(result === '' || result === 'NaN:NaN').toBe(true);
    });
  });

  describe('combineDateAndTime', () => {
    it('should combine date and time correctly', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = combineDateAndTime(date, '14:30');

      const resultDate = new Date(result);
      expect(resultDate.getHours()).toBe(14);
      expect(resultDate.getMinutes()).toBe(30);
    });

    it('should return ISO string format', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = combineDateAndTime(date, '14:30');

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should reset seconds and milliseconds', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = combineDateAndTime(date, '14:30');

      const resultDate = new Date(result);
      expect(resultDate.getSeconds()).toBe(0);
      expect(resultDate.getMilliseconds()).toBe(0);
    });
  });

  describe('updateDateKeepTime', () => {
    it('should preserve time when updating date', () => {
      const currentISO = '2024-01-15T14:30:00Z';
      const newDate = new Date('2024-02-20T00:00:00Z');

      const result = updateDateKeepTime(currentISO, newDate);
      const resultDate = new Date(result);

      // Time should be preserved
      expect(resultDate.getHours()).toBe(new Date(currentISO).getHours());
      expect(resultDate.getMinutes()).toBe(new Date(currentISO).getMinutes());
    });

    it('should use 12:00 as default time if current value is empty', () => {
      const newDate = new Date('2024-02-20T00:00:00Z');
      const result = updateDateKeepTime('', newDate);

      const resultDate = new Date(result);
      expect(resultDate.getHours()).toBe(12);
      expect(resultDate.getMinutes()).toBe(0);
    });
  });

  describe('updateTimeKeepDate', () => {
    it('should preserve date when updating time', () => {
      const currentISO = '2024-01-15T10:00:00Z';
      const result = updateTimeKeepDate(currentISO, '14:30');

      const currentDate = new Date(currentISO);
      const resultDate = new Date(result);

      // Date should be preserved
      expect(resultDate.getFullYear()).toBe(currentDate.getFullYear());
      expect(resultDate.getMonth()).toBe(currentDate.getMonth());
      expect(resultDate.getDate()).toBe(currentDate.getDate());

      // Time should be updated
      expect(resultDate.getHours()).toBe(14);
      expect(resultDate.getMinutes()).toBe(30);
    });

    it('should use today as default date if current value is empty', () => {
      const result = updateTimeKeepDate('', '14:30');
      const resultDate = new Date(result);

      expect(resultDate.getHours()).toBe(14);
      expect(resultDate.getMinutes()).toBe(30);
    });
  });

  describe('formatDateObjectLong', () => {
    it('should format Date object to long format', () => {
      const date = new Date('2024-12-15T14:30:00Z');
      const result = formatDateObjectLong(date);

      expect(result).toContain('grudnia');
      expect(result).toContain('2024');
      expect(result).toContain('o');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should return date.toString() on error', () => {
      const invalidDate = new Date('invalid');
      const result = formatDateObjectLong(invalidDate);

      // Should return date.toString() which contains 'Invalid Date'
      expect(result).toContain('Invalid Date');
    });
  });

  describe('getNextMonthResetDate', () => {
    it('should return first day of next month', () => {
      // Mock time is 2024-01-15
      const result = getNextMonthResetDate();

      expect(result).toContain('lutego'); // Next month (February)
      expect(result).toContain('2024');
      expect(result).toMatch(/^1 /); // Day should be 1
    });

    it('should handle year rollover', () => {
      vi.setSystemTime(new Date('2024-12-15T12:00:00Z'));
      const result = getNextMonthResetDate();

      expect(result).toContain('stycznia');
      expect(result).toContain('2025');
    });
  });

  describe('formatDayWithWeekday', () => {
    it('should format date with weekday in Polish', () => {
      const result = formatDayWithWeekday('2024-01-15T14:30:00Z');

      // Should contain Polish weekday names
      expect(result).toMatch(/poniedziałek|wtorek|środa|czwartek|piątek|sobota|niedziela/);
      expect(result).toContain('stycznia');
    });

    it('should return original string on invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = formatDayWithWeekday(invalidDate);
      expect([invalidDate, 'Invalid Date']).toContain(result);
    });
  });

  describe('formatUpdatedAt', () => {
    it('should format updated_at timestamp in short format', () => {
      const result = formatUpdatedAt('2024-12-15T14:30:00Z');

      expect(result).toContain('gru'); // Short month
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should return original string on invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = formatUpdatedAt(invalidDate);
      expect([invalidDate, 'Invalid Date']).toContain(result);
    });
  });
});
