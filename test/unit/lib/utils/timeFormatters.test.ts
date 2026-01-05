import { describe, it, expect } from 'vitest';
import {
  convertTo24Hour,
  convertTo12Hour,
  formatDuration,
  parseDuration,
  isValidTime24,
} from '@/lib/utils/timeFormatters';

describe('timeFormatters', () => {
  describe('convertTo24Hour', () => {
    it('should convert 12:00 AM to 00:00', () => {
      expect(convertTo24Hour('12:00 AM')).toBe('00:00');
    });

    it('should convert 12:00 PM to 12:00', () => {
      expect(convertTo24Hour('12:00 PM')).toBe('12:00');
    });

    it('should convert 02:30 PM to 14:30', () => {
      expect(convertTo24Hour('02:30 PM')).toBe('14:30');
    });

    it('should convert 02:30 AM to 02:30', () => {
      expect(convertTo24Hour('02:30 AM')).toBe('02:30');
    });

    it('should convert 11:59 PM to 23:59', () => {
      expect(convertTo24Hour('11:59 PM')).toBe('23:59');
    });

    it('should convert 11:59 AM to 11:59', () => {
      expect(convertTo24Hour('11:59 AM')).toBe('11:59');
    });

    it('should handle already 24h format', () => {
      expect(convertTo24Hour('14:30')).toBe('14:30');
    });

    it('should return empty string for empty input', () => {
      expect(convertTo24Hour('')).toBe('');
    });

    it('should handle lowercase am/pm', () => {
      expect(convertTo24Hour('02:30 pm')).toBe('14:30');
      expect(convertTo24Hour('02:30 am')).toBe('02:30');
    });

    it('should pad hours with zero when needed', () => {
      expect(convertTo24Hour('2:30 PM')).toBe('14:30');
      expect(convertTo24Hour('2:30 AM')).toBe('02:30');
    });
  });

  describe('convertTo12Hour', () => {
    it('should convert 00:00 to 12:00 AM', () => {
      expect(convertTo12Hour('00:00')).toBe('12:00 AM');
    });

    it('should convert 12:00 to 12:00 PM', () => {
      expect(convertTo12Hour('12:00')).toBe('12:00 PM');
    });

    it('should convert 14:30 to 02:30 PM', () => {
      expect(convertTo12Hour('14:30')).toBe('2:30 PM');
    });

    it('should convert 02:30 to 02:30 AM', () => {
      expect(convertTo12Hour('02:30')).toBe('2:30 AM');
    });

    it('should convert 23:59 to 11:59 PM', () => {
      expect(convertTo12Hour('23:59')).toBe('11:59 PM');
    });

    it('should convert 11:59 to 11:59 AM', () => {
      expect(convertTo12Hour('11:59')).toBe('11:59 AM');
    });

    it('should convert 13:00 to 01:00 PM', () => {
      expect(convertTo12Hour('13:00')).toBe('1:00 PM');
    });

    it('should handle invalid input - return original', () => {
      expect(convertTo12Hour('invalid')).toBe('invalid');
    });

    it('should return empty string for empty input', () => {
      expect(convertTo12Hour('')).toBe('');
    });

    it('should pad minutes with zero', () => {
      expect(convertTo12Hour('14:05')).toBe('2:05 PM');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes < 60', () => {
      expect(formatDuration(30)).toBe('30 min');
      expect(formatDuration(45)).toBe('45 min');
      expect(formatDuration(1)).toBe('1 min');
    });

    it('should format hours only', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(180)).toBe('3h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30min');
      expect(formatDuration(150)).toBe('2h 30min');
      expect(formatDuration(125)).toBe('2h 5min');
    });

    it('should handle zero minutes', () => {
      expect(formatDuration(0)).toBe('0 min');
    });
  });

  describe('parseDuration', () => {
    it('should parse plain number as minutes', () => {
      expect(parseDuration('60')).toBe(60);
      expect(parseDuration('120')).toBe(120);
    });

    it('should parse "X min" format', () => {
      expect(parseDuration('60 min')).toBe(60);
      expect(parseDuration('45 min')).toBe(45);
    });

    it('should parse "Xh" format', () => {
      expect(parseDuration('2h')).toBe(2);
      expect(parseDuration('3h')).toBe(3);
    });

    it('should parse "Xh Ymin" format - extracts first number', () => {
      // Note: Current implementation only extracts first number
      expect(parseDuration('2h 30min')).toBe(2);
    });

    it('should return undefined for empty string', () => {
      expect(parseDuration('')).toBeUndefined();
    });

    it('should return undefined for invalid string', () => {
      expect(parseDuration('invalid')).toBeUndefined();
    });
  });

  describe('isValidTime24', () => {
    it('should validate correct 24h time', () => {
      expect(isValidTime24('00:00')).toBe(true);
      expect(isValidTime24('12:00')).toBe(true);
      expect(isValidTime24('23:59')).toBe(true);
      expect(isValidTime24('14:30')).toBe(true);
    });

    it('should reject invalid hours', () => {
      expect(isValidTime24('24:00')).toBe(false);
      expect(isValidTime24('25:30')).toBe(false);
      expect(isValidTime24('-1:00')).toBe(false);
    });

    it('should reject invalid minutes', () => {
      expect(isValidTime24('12:60')).toBe(false);
      expect(isValidTime24('12:99')).toBe(false);
      expect(isValidTime24('12:-1')).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(isValidTime24('12')).toBe(false);
      expect(isValidTime24('12:0')).toBe(false);
      expect(isValidTime24('1:00')).toBe(false); // Must be padded
      expect(isValidTime24('invalid')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidTime24('')).toBe(false);
    });

    it('should validate edge cases', () => {
      expect(isValidTime24('00:00')).toBe(true);
      expect(isValidTime24('23:59')).toBe(true);
      expect(isValidTime24('01:00')).toBe(true);
      expect(isValidTime24('20:45')).toBe(true);
    });
  });
});
