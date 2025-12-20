import { useCallback } from 'react';
import { formatDateTime } from '@/lib/utils/dateFormatters';
import { getPlanStatusConfig } from '@/lib/constants/planStatus';
import type { PlanStatus } from '@/types';

type UsePlanCardProps = {
  planId: string;
  status: PlanStatus;
  onDelete: (planId: string) => void;
  onClick: () => void;
};

/**
 * Custom hook for PlanCard logic
 * Extracts formatting and event handling from the presentation layer
 */
export function usePlanCard({ planId, status, onDelete, onClick }: UsePlanCardProps) {
  const statusConfig = getPlanStatusConfig(status);

  /**
   * Format a date string for display in the plan card
   */
  const formatCardDateTime = useCallback((dateString: string): string => {
    return formatDateTime(dateString, { dateStyle: 'short', includeYear: true });
  }, []);

  /**
   * Handle delete button click with event propagation stopped
   */
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(planId);
    },
    [onDelete, planId]
  );

  /**
   * Handle keyboard navigation for the card
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return {
    statusConfig,
    formatCardDateTime,
    handleDelete,
    handleKeyDown,
  };
}
