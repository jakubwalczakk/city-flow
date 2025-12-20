import type { PlanStatus } from '@/types';

/**
 * Configuration for plan status display
 * Maps status values to human-readable labels and badge variants
 */
export type PlanStatusConfig = {
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
};

export const PLAN_STATUS_CONFIG: Record<PlanStatus, PlanStatusConfig> = {
  draft: { label: 'Szkic', variant: 'secondary' },
  generated: { label: 'Wygenerowany', variant: 'default' },
  archived: { label: 'Zarchiwizowany', variant: 'outline' },
} as const;

/**
 * Get status configuration for a given plan status
 * @param status - The plan status
 * @returns The status configuration with label and variant
 */
export function getPlanStatusConfig(status: PlanStatus): PlanStatusConfig {
  return PLAN_STATUS_CONFIG[status];
}
