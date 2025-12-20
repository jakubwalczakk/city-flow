/**
 * Date and time helpers specifically for form inputs
 * Handles conversion between ISO strings and form-friendly formats
 */

/**
 * Extracts date from ISO string for date picker
 * @param dateStr - ISO date string
 * @returns Date object or undefined
 */
export function getDateForPicker(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    return new Date(dateStr);
  } catch {
    return undefined;
  }
}

/**
 * Extracts time in HH:MM format for time input
 * @param dateStr - ISO date string
 * @returns Time string in HH:MM format
 */
export function getTimeForInput(dateStr: string): string {
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
 * Combines date and time into ISO string format for form submission
 * @param date - Date object from date picker
 * @param timeStr - Time string in HH:MM format
 * @returns ISO date-time string in format YYYY-MM-DDTHH:MM
 */
export function combineDateTimeForForm(date: Date, timeStr: string): string {
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
 * Updates date while preserving time from current value
 * @param currentValue - Current form value (ISO string)
 * @param newDate - New date from date picker
 * @returns Updated ISO string
 */
export function updateDateInForm(currentValue: string, newDate: Date): string {
  const currentTime = currentValue ? getTimeForInput(currentValue) : '12:00';
  return combineDateTimeForForm(newDate, currentTime);
}

/**
 * Updates time while preserving date from current value
 * @param currentValue - Current form value (ISO string)
 * @param newTime - New time in HH:MM format
 * @returns Updated ISO string
 */
export function updateTimeInForm(currentValue: string, newTime: string): string {
  const date = currentValue ? new Date(currentValue) : new Date();
  return combineDateTimeForForm(date, newTime);
}
