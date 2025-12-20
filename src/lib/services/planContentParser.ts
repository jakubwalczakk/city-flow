/**
 * Service for parsing and validating generated plan content
 * Handles conversion from raw JSON to typed view models
 */

import type { GeneratedContentViewModel, DayPlan } from '@/types';

type RawDay = {
  date: unknown;
  items?: unknown;
};

type RawItem = {
  id: unknown;
  title: unknown;
  category?: unknown;
  type?: unknown;
  [key: string]: unknown;
};

type RawGeneratedContent = {
  days?: unknown;
  summary?: unknown;
  currency?: unknown;
  modifications?: unknown;
  warnings?: unknown;
};

/**
 * Parses the generated_content JSON into a structured view model.
 * Validates the structure and provides default values for backward compatibility.
 * @param content - Raw content from database
 * @returns Parsed view model or null if invalid
 */
export function parseGeneratedContent(content: unknown): GeneratedContentViewModel | null {
  if (!content || typeof content !== 'object') {
    return null;
  }

  try {
    const data = content as RawGeneratedContent;

    if (!data.days || !Array.isArray(data.days)) {
      return null;
    }

    // Process days and items, adding default category if missing
    const processedDays: DayPlan[] = data.days.map((day: unknown, dayIndex: number) => {
      const dayObj = day as RawDay;
      if (!dayObj.date || typeof dayObj.date !== 'string' || !dayObj.items || !Array.isArray(dayObj.items)) {
        throw new Error(`Day object at index ${dayIndex} is malformed.`);
      }

      const processedItems = dayObj.items.map((item: unknown, itemIndex: number) => {
        const itemObj = item as RawItem;
        if (!itemObj.id || !itemObj.title || typeof itemObj.id !== 'string' || typeof itemObj.title !== 'string') {
          throw new Error(`Item object at index ${itemIndex} in day ${dayIndex} is missing required fields.`);
        }

        // For backward compatibility, provide defaults if missing
        return {
          ...itemObj,
          id: itemObj.id as string,
          title: itemObj.title as string,
          category: (itemObj.category as string) || 'other',
          type: (itemObj.type as string) || 'activity', // Required by database schema
        };
      });

      return {
        date: dayObj.date as string,
        items: processedItems,
      };
    });

    return {
      summary: typeof data.summary === 'string' ? data.summary : 'Brak podsumowania.',
      currency: typeof data.currency === 'string' ? data.currency : 'PLN',
      days: processedDays,
      modifications: Array.isArray(data.modifications) ? (data.modifications as string[]) : undefined,
      warnings: Array.isArray(data.warnings) ? (data.warnings as string[]) : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Validates if content has valid structure
 * @param content - Raw content to validate
 * @returns true if valid, false otherwise
 */
export function isValidGeneratedContent(content: unknown): boolean {
  return parseGeneratedContent(content) !== null;
}
