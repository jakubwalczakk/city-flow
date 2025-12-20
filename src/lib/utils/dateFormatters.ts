/**
 * Shared date and time formatting utilities
 * Used across components to ensure consistent date/time display
 */

/**
 * Formats a date range between two dates
 * @param startDate - ISO date string for start
 * @param endDate - ISO date string for end
 * @returns Formatted date range string in Polish locale
 */
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) {
    return 'Daty nie ustawione';
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `Od ${formatDate(startDate)}`;
  }

  if (endDate) {
    return `Do ${formatDate(endDate)}`;
  }

  return '';
}

/**
 * Formats a date and time in Polish locale
 * @param isoString - ISO date-time string
 * @param options - Optional formatting options
 * @returns Formatted date-time string
 */
export function formatDateTime(
  isoString: string,
  options?: {
    dateStyle?: 'short' | 'medium' | 'long';
    timeStyle?: 'short' | 'medium';
    includeYear?: boolean;
  }
): string {
  try {
    const date = new Date(isoString);
    const { dateStyle = 'medium', timeStyle = 'short', includeYear = true } = options || {};

    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    if (dateStyle === 'short') {
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
    } else if (dateStyle === 'medium') {
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
    } else if (dateStyle === 'long') {
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
    }

    if (includeYear) {
      formatOptions.year = 'numeric';
    }

    if (timeStyle === 'medium') {
      formatOptions.second = '2-digit';
    }

    return date.toLocaleString('pl-PL', formatOptions);
  } catch {
    return isoString;
  }
}

/**
 * Formats a date in long format (e.g., "15 grudnia 2025, 14:30")
 * @param isoString - ISO date-time string
 * @returns Formatted date string
 */
export function formatDateTimeLong(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('pl-PL', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats only the date part in long format
 * @param isoString - ISO date string
 * @returns Formatted date string (e.g., "15 grudnia 2025")
 */
export function formatDateOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pl-PL', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/**
 * Extracts date from ISO string as Date object
 * @param dateStr - ISO date string
 * @returns Date object or undefined
 */
export function getDateFromISO(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    return new Date(dateStr);
  } catch {
    return undefined;
  }
}

/**
 * Extracts time from ISO string in HH:MM format
 * @param dateStr - ISO date string
 * @returns Time string in HH:MM format
 */
export function getTimeFromISO(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Combines a date and time into ISO string
 * @param date - Date object
 * @param timeStr - Time string in HH:MM format
 * @returns ISO date-time string
 */
export function combineDateAndTime(date: Date, timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours);
  combined.setMinutes(minutes);

  const year = combined.getFullYear();
  const month = String(combined.getMonth() + 1).padStart(2, '0');
  const day = String(combined.getDate()).padStart(2, '0');
  const h = String(combined.getHours()).padStart(2, '0');
  const m = String(combined.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${h}:${m}`;
}

/**
 * Updates the date part while preserving time
 * @param currentISO - Current ISO date-time string
 * @param newDate - New date to set
 * @returns Updated ISO date-time string
 */
export function updateDateKeepTime(currentISO: string, newDate: Date): string {
  const current = currentISO ? new Date(currentISO) : new Date();
  const hours = currentISO ? current.getHours() : 12;
  const minutes = currentISO ? current.getMinutes() : 0;

  newDate.setHours(hours);
  newDate.setMinutes(minutes);

  return combineDateAndTime(newDate, `${hours}:${minutes}`);
}

/**
 * Updates the time part while preserving date
 * @param currentISO - Current ISO date-time string or empty
 * @param timeStr - Time string in HH:MM format
 * @returns Updated ISO date-time string
 */
export function updateTimeKeepDate(currentISO: string, timeStr: string): string {
  const date = currentISO ? new Date(currentISO) : new Date();
  return combineDateAndTime(date, timeStr);
}
