/**
 * Timeline category configuration with icons and labels
 * Centralizes category metadata for consistent display across components
 */

import { Landmark, Utensils, Dumbbell, Trees, Palette, ArrowLeftRight, Hotel, Circle } from 'lucide-react';
import type { TimelineItemCategory } from '@/types';
import type { LucideIcon } from 'lucide-react';

export type CategoryConfig = {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
};

/**
 * Complete configuration for each timeline item category
 * Includes icon component, Polish label, and color styling
 */
export const TIMELINE_CATEGORIES: Record<TimelineItemCategory, CategoryConfig> = {
  history: {
    icon: Landmark,
    label: 'Historia',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  food: {
    icon: Utensils,
    label: 'Jedzenie',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  sport: {
    icon: Dumbbell,
    label: 'Sport',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  nature: {
    icon: Trees,
    label: 'Natura',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  culture: {
    icon: Palette,
    label: 'Kultura',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  transport: {
    icon: ArrowLeftRight,
    label: 'Transport',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  accommodation: {
    icon: Hotel,
    label: 'Zakwaterowanie',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  other: {
    icon: Circle,
    label: 'Inne',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
};

/**
 * Get category icon component
 * @param category - Timeline item category
 * @returns Lucide icon component
 */
export function getCategoryIcon(category: TimelineItemCategory): LucideIcon {
  return TIMELINE_CATEGORIES[category]?.icon || TIMELINE_CATEGORIES.other.icon;
}

/**
 * Get category label in Polish
 * @param category - Timeline item category
 * @returns Polish label for the category
 */
export function getCategoryLabel(category: TimelineItemCategory): string {
  return TIMELINE_CATEGORIES[category]?.label || TIMELINE_CATEGORIES.other.label;
}

/**
 * Get category color class
 * @param category - Timeline item category
 * @returns Tailwind color class
 */
export function getCategoryColor(category: TimelineItemCategory): string {
  return TIMELINE_CATEGORIES[category]?.color || TIMELINE_CATEGORIES.other.color;
}

/**
 * Get category background color class
 * @param category - Timeline item category
 * @returns Tailwind background color class
 */
export function getCategoryBgColor(category: TimelineItemCategory): string {
  return TIMELINE_CATEGORIES[category]?.bgColor || TIMELINE_CATEGORIES.other.bgColor;
}
