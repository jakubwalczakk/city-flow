/**
 * Client-side API service for plan form operations.
 * Handles all API communication for creating and updating plans from the form.
 */

import type { CreatePlanCommand, PlanDetailsDto, FixedPointDto, FixedPointFormItem } from '@/types';

/**
 * Error response from API
 */
type ApiErrorResponse = {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
  };
};

/**
 * Result of batch operation on fixed points
 */
type FixedPointBatchResult = {
  success: boolean;
  errors: string[];
};

/**
 * Normalizes date string to ISO 8601 format
 */
function normalizeToISO(dateStr: string): string {
  if (!dateStr) return dateStr;
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
}

/**
 * Extracts error message from API response
 */
async function extractErrorMessage(response: Response, defaultMessage: string): Promise<string> {
  try {
    const errorData: ApiErrorResponse = await response.json();
    let errorMessage = errorData.error || defaultMessage;

    if (errorData.details?.fieldErrors) {
      const fieldMessages = Object.entries(errorData.details.fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      errorMessage += ` (${fieldMessages})`;
    }

    return errorMessage;
  } catch {
    return `${defaultMessage} (HTTP ${response.status})`;
  }
}

/**
 * Fetches plan details by ID
 */
async function fetchPlanDetails(planId: string): Promise<PlanDetailsDto> {
  const response = await fetch(`/api/plans/${planId}`);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to fetch plan details');
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetches fixed points for a plan
 */
async function fetchFixedPoints(planId: string): Promise<FixedPointDto[]> {
  const response = await fetch(`/api/plans/${planId}/fixed-points`);

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to fetch fixed points');
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Creates a new plan
 */
async function createPlan(command: CreatePlanCommand): Promise<PlanDetailsDto> {
  const response = await fetch('/api/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to create plan');
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Updates an existing plan (partial update)
 */
async function updatePlan(
  planId: string,
  data: {
    name: string;
    start_date: string;
    end_date: string;
    notes: string | null;
  }
): Promise<void> {
  const response = await fetch(`/api/plans/${planId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to update plan');
    throw new Error(errorMessage);
  }
}

/**
 * Creates a new fixed point
 */
async function createFixedPoint(planId: string, point: Omit<FixedPointFormItem, 'id'>): Promise<void> {
  const response = await fetch(`/api/plans/${planId}/fixed-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: point.location,
      event_at: normalizeToISO(point.event_at),
      event_duration: point.event_duration,
      description: point.description,
    }),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to create fixed point');
    throw new Error(errorMessage);
  }
}

/**
 * Updates an existing fixed point
 */
async function updateFixedPoint(planId: string, pointId: string, point: Omit<FixedPointFormItem, 'id'>): Promise<void> {
  const response = await fetch(`/api/plans/${planId}/fixed-points/${pointId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: point.location,
      event_at: normalizeToISO(point.event_at),
      event_duration: point.event_duration,
      description: point.description,
    }),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to update fixed point');
    throw new Error(errorMessage);
  }
}

/**
 * Deletes a fixed point
 */
async function deleteFixedPoint(planId: string, pointId: string): Promise<void> {
  const response = await fetch(`/api/plans/${planId}/fixed-points/${pointId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'Failed to delete fixed point');
    throw new Error(errorMessage);
  }
}

/**
 * Synchronizes fixed points with the server (batch operation)
 * Creates new points, updates existing ones, and deletes removed ones
 */
async function syncFixedPoints(planId: string, formPoints: FixedPointFormItem[]): Promise<FixedPointBatchResult> {
  // Fetch existing points from server
  let existingPointIds: string[] = [];
  try {
    const existingPoints = await fetchFixedPoints(planId);
    existingPointIds = existingPoints.map((point) => point.id);
  } catch {
    // If we can't fetch existing points, continue with empty list
  }

  // Categorize points
  const pointsToUpdate = formPoints.filter((p) => p.id);
  const pointsToCreate = formPoints.filter((p) => !p.id);
  const formPointIds = formPoints.map((p) => p.id).filter(Boolean) as string[];
  const pointsToDelete = existingPointIds.filter((id) => !formPointIds.includes(id));

  const errors: string[] = [];

  // Update existing points
  if (pointsToUpdate.length > 0) {
    const updatePromises = pointsToUpdate.map((point) => {
      // We know point.id exists here because of the filter
      const pointId = point.id as string;
      return updateFixedPoint(planId, pointId, point);
    });

    const updateResults = await Promise.allSettled(updatePromises);
    updateResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push(`Update ${index + 1}: ${result.reason.message}`);
      }
    });
  }

  // Create new points
  if (pointsToCreate.length > 0) {
    const createPromises = pointsToCreate.map((point) => createFixedPoint(planId, point));

    const createResults = await Promise.allSettled(createPromises);
    createResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push(`Create ${index + 1}: ${result.reason.message}`);
      }
    });
  }

  // Delete removed points (only if no errors so far)
  if (errors.length === 0 && pointsToDelete.length > 0) {
    const deletePromises = pointsToDelete.map((pointId) => deleteFixedPoint(planId, pointId));

    // Don't throw on delete failure - updates/creates are already saved
    await Promise.allSettled(deletePromises);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Triggers AI generation for a plan
 */
async function generatePlan(planId: string): Promise<void> {
  const response = await fetch(`/api/plans/${planId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response, 'An unknown error occurred during plan generation');
    throw new Error(`The plan could not be generated: ${errorMessage}`);
  }
}

/**
 * API service for plan form operations
 */
export const PlanFormApiService = {
  fetchPlanDetails,
  fetchFixedPoints,
  createPlan,
  updatePlan,
  createFixedPoint,
  updateFixedPoint,
  deleteFixedPoint,
  syncFixedPoints,
  generatePlan,
};
