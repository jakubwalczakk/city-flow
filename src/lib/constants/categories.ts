import type { TimelineItemCategory } from '@/types';

/**
 * Available activity categories with labels.
 * Used in activity forms and filters.
 */
export const ACTIVITY_CATEGORIES: { value: TimelineItemCategory; label: string }[] = [
  { value: 'history', label: 'Historia' },
  { value: 'food', label: 'Jedzenie' },
  { value: 'sport', label: 'Sport' },
  { value: 'nature', label: 'Natura' },
  { value: 'culture', label: 'Kultura' },
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Zakwaterowanie' },
  { value: 'other', label: 'Inne' },
] as const;

/**
 * Get category label by value
 */
export function getCategoryLabel(value: TimelineItemCategory): string {
  const category = ACTIVITY_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
}
