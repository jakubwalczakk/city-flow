/**
 * Utility functions for time formatting and conversion
 */

/**
 * Convert time from 12-hour format to 24-hour format
 * @param time12 - Time string in 12-hour format (e.g., "02:30 PM")
 * @returns Time string in 24-hour format (e.g., "14:30")
 */
export function convertTo24Hour(time12: string): string {
  if (!time12) return '';

  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12; // Already in 24h format or invalid

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Convert time from 24-hour format to 12-hour format
 * @param time24 - Time string in 24-hour format (e.g., "14:30")
 * @returns Time string in 12-hour format (e.g., "02:30 PM")
 */
export function convertTo12Hour(time24: string): string {
  if (!time24) return '';

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "2h 30min" or "45min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Parse duration string to minutes
 * @param durationStr - Duration string (e.g., "60 min", "2h 30min", "45")
 * @returns Duration in minutes or undefined if invalid
 */
export function parseDuration(durationStr: string): number | undefined {
  if (!durationStr) return undefined;

  // Match patterns like "60 min", "2h 30min", "2h", or just "60"
  const match = durationStr.match(/(\d+)/);
  if (!match) return undefined;

  return parseInt(match[1], 10);
}

/**
 * Validate if time string is in valid 24-hour format
 * @param time - Time string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTime24(time: string): boolean {
  if (!time) return false;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}
