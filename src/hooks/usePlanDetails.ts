import { useState, useEffect, useCallback } from 'react';
import type {
  PlanDetailsDto,
  UpdatePlanCommand,
  AddActivityCommand,
  UpdateActivityCommand,
  TimelineItem,
} from '@/types';

/**
 * Result type returned by the usePlanDetails hook.
 */
export type UsePlanDetailsResult = {
  plan: PlanDetailsDto | null;
  isLoading: boolean;
  error: string | null;
  updatePlanName: (newName: string) => Promise<void>;
  archivePlan: () => Promise<void>;
  deletePlan: () => Promise<void>;
  addActivity: (date: string, activity: Partial<TimelineItem>) => Promise<void>;
  updateActivity: (date: string, itemId: string, activity: Partial<TimelineItem>) => Promise<void>;
  deleteActivity: (date: string, itemId: string) => Promise<void>;
  generatePlan: () => Promise<void>;
  refetch: () => void;
};

/**
 * Custom hook for managing a single plan's details.
 * Automatically fetches plan data on mount and provides methods for updates and deletion.
 *
 * @param planId - The ID of the plan to fetch
 * @returns Object containing plan data, loading state, error state, and action methods
 */
export const usePlanDetails = (planId: string): UsePlanDetailsResult => {
  const [plan, setPlan] = useState<PlanDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Plan not found');
        }
        throw new Error(`Failed to fetch plan: ${response.statusText}`);
      }

      const result: PlanDetailsDto = await response.json();
      setPlan(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching plan.';
      setError(errorMessage);
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  /**
   * Updates the plan's name.
   *
   * @param newName - The new name for the plan
   * @throws Error if the update fails
   */
  const updatePlanName = useCallback(
    async (newName: string): Promise<void> => {
      const command: UpdatePlanCommand = { name: newName };

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update plan name');
      }

      const updatedPlan: PlanDetailsDto = await response.json();
      setPlan(updatedPlan);
    },
    [planId]
  );

  /**
   * Archives the plan.
   *
   * @throws Error if the operation fails
   */
  const archivePlan = useCallback(async (): Promise<void> => {
    const command: UpdatePlanCommand = { status: 'archived' };

    const response = await fetch(`/api/plans/${planId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to archive plan');
    }

    const updatedPlan: PlanDetailsDto = await response.json();
    setPlan(updatedPlan);
  }, [planId]);

  /**
   * Deletes the plan.
   *
   * @throws Error if the deletion fails
   */
  const deletePlan = useCallback(async (): Promise<void> => {
    const response = await fetch(`/api/plans/${planId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete plan');
    }
  }, [planId]);

  /**
   * Adds a new activity to a specific day in the plan.
   *
   * @param date - The date of the day (e.g., "2025-11-10")
   * @param activity - The activity data to add
   * @throws Error if the operation fails
   */
  const addActivity = useCallback(
    async (date: string, activity: Partial<TimelineItem>): Promise<void> => {
      // Convert TimelineItem to AddActivityCommand format
      const command: AddActivityCommand = {
        time: activity.time,
        title: activity.title || '',
        description: activity.description,
        location: activity.location,
        duration: activity.duration,
        category: activity.category || 'other',
        estimated_cost: activity.estimated_price,
      };

      const response = await fetch(`/api/plans/${planId}/days/${date}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add activity');
      }

      const updatedPlan: PlanDetailsDto = await response.json();
      setPlan(updatedPlan);
    },
    [planId]
  );

  /**
   * Updates an existing activity in the plan.
   *
   * @param date - The date of the day (e.g., "2025-11-10")
   * @param itemId - The ID of the activity to update
   * @param activity - The updated activity data
   * @throws Error if the operation fails
   */
  const updateActivity = useCallback(
    async (date: string, itemId: string, activity: Partial<TimelineItem>): Promise<void> => {
      // Convert TimelineItem to UpdateActivityCommand format
      const command: UpdateActivityCommand = {
        time: activity.time,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        duration: activity.duration,
        category: activity.category,
        estimated_cost: activity.estimated_price,
      };

      const response = await fetch(`/api/plans/${planId}/days/${date}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update activity');
      }

      const updatedPlan: PlanDetailsDto = await response.json();
      setPlan(updatedPlan);
    },
    [planId]
  );

  /**
   * Deletes an activity from the plan.
   *
   * @param date - The date of the day (e.g., "2025-11-10")
   * @param itemId - The ID of the activity to delete
   * @throws Error if the operation fails
   */
  const deleteActivity = useCallback(
    async (date: string, itemId: string): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/days/${date}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete activity');
      }

      const updatedPlan: PlanDetailsDto = await response.json();
      setPlan(updatedPlan);
    },
    [planId]
  );

  /**
   * Generates the plan using AI.
   *
   * @throws Error if the generation fails
   */
  const generatePlan = useCallback(async (): Promise<void> => {
    // Save current notes first if needed - assuming they are saved via other calls
    // But DraftPlanView saves notes separately.

    const response = await fetch(`/api/plans/${planId}/generate`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate plan');
    }

    const updatedPlan: PlanDetailsDto = await response.json();
    setPlan(updatedPlan);
  }, [planId]);

  // Fetch plan on mount or when planId changes
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    plan,
    isLoading,
    error,
    updatePlanName,
    archivePlan,
    deletePlan,
    addActivity,
    updateActivity,
    deleteActivity,
    generatePlan,
    refetch: fetchPlan,
  };
};
