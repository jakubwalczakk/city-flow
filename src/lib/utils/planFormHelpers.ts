/**
 * Helper utilities for plan form operations
 */

import type { PlanDetailsDto, FixedPointDto, FixedPointFormItem } from '@/types';

/**
 * Creates default start date (tomorrow at 9:00 AM)
 */
export function getDefaultStartDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

/**
 * Creates default end date (3 days from tomorrow at 18:00)
 */
export function getDefaultEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  date.setHours(18, 0, 0, 0);
  return date;
}

/**
 * Determines the starting step based on what's already filled in the plan
 * @returns Step number (1 or 2)
 */
export function determineStartingStep(plan: PlanDetailsDto): number {
  // Check if basic info (step 1) is complete
  const hasBasicInfo = plan.name && plan.destination && plan.start_date && plan.end_date;

  if (!hasBasicInfo) {
    return 1; // Start from the beginning
  }

  // If basic info is complete, start from step 2 (fixed points)
  return 2;
}

/**
 * Converts FixedPointDto array to FixedPointFormItem array
 * Preserves IDs for updates
 */
export function convertFixedPointsToFormItems(fixedPoints: FixedPointDto[]): FixedPointFormItem[] {
  return fixedPoints.map((fp) => ({
    id: fp.id,
    location: fp.location,
    event_at: fp.event_at,
    event_duration: fp.event_duration,
    description: fp.description,
  }));
}

/**
 * Generates a default plan name from destination
 */
export function generateDefaultPlanName(destination: string): string {
  return destination ? `${destination} trip` : 'New trip';
}
