import { useState, useEffect, useCallback } from 'react';
import type { PaginatedPlansDto, PlanStatus } from '@/types';

/**
 * Parameters for fetching plans.
 */
export type UsePlansParams = {
  status?: PlanStatus | PlanStatus[];
  limit: number;
  offset: number;
  sortBy?: 'created_at' | 'name';
  order?: 'asc' | 'desc';
};

/**
 * Result type returned by the usePlans hook.
 */
export type UsePlansResult = {
  data: PaginatedPlansDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Custom hook for fetching plans from the API.
 * Automatically refetches when parameters change.
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Object containing data, loading state, error state, and refetch function
 */
export const usePlans = (params: UsePlansParams): UsePlansResult => {
  const [data, setData] = useState<PaginatedPlansDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const searchParams = new URLSearchParams();

      // Always use 'statuses' parameter (supports single or multiple values)
      if (params.status) {
        const statusArray = Array.isArray(params.status) ? params.status : [params.status];
        searchParams.set('statuses', statusArray.join(','));
      }

      searchParams.set('limit', params.limit.toString());
      searchParams.set('offset', params.offset.toString());

      if (params.sortBy) {
        searchParams.set('sort_by', params.sortBy);
      }

      if (params.order) {
        searchParams.set('order', params.order);
      }

      // Fetch plans from API
      const response = await fetch(`/api/plans?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.statusText}`);
      }

      const result: PaginatedPlansDto = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching plans.';
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.status, params.limit, params.offset, params.sortBy, params.order]);

  // Refetch when parameters change
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPlans,
  };
};
