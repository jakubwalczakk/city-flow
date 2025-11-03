import { useState, useEffect, useCallback } from "react";
import type { PlanDetailsDto, UpdatePlanCommand } from "@/types";

/**
 * Result type returned by the usePlanDetails hook.
 */
export type UsePlanDetailsResult = {
  plan: PlanDetailsDto | null;
  isLoading: boolean;
  error: string | null;
  updatePlanName: (newName: string) => Promise<void>;
  deletePlan: () => Promise<void>;
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
          throw new Error("Plan not found");
        }
        throw new Error(`Failed to fetch plan: ${response.statusText}`);
      }

      const result: PlanDetailsDto = await response.json();
      setPlan(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred while fetching plan.";
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update plan name");
      }

      const updatedPlan: PlanDetailsDto = await response.json();
      setPlan(updatedPlan);
    },
    [planId]
  );

  /**
   * Deletes the plan.
   *
   * @throws Error if the deletion fails
   */
  const deletePlan = useCallback(async (): Promise<void> => {
    const response = await fetch(`/api/plans/${planId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete plan");
    }
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
    deletePlan,
    refetch: fetchPlan,
  };
};

