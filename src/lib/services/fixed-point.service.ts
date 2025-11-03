import type {
  CreateFixedPointCommand,
  UpdateFixedPointCommand,
  FixedPointDto,
} from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Creates a new fixed point for a plan.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan to add the fixed point to
 * @param command - The fixed point creation data
 * @param userId - The ID of the user creating the fixed point
 * @returns The newly created fixed point
 * @throws {NotFoundError} If the plan doesn't exist or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const createFixedPoint = async (
  supabase: SupabaseClient,
  planId: string,
  command: CreateFixedPointCommand,
  userId: string
): Promise<FixedPointDto> => {
  logger.debug("Creating fixed point", { planId, userId });

  // First verify the plan exists and belongs to the user
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (planError || !plan) {
    logger.warn("Plan not found or unauthorized", {
      planId,
      userId,
      error: planError?.message,
    });
    throw new NotFoundError("Plan not found or you don't have access to it");
  }

  // Create the fixed point
  const { data, error } = await supabase
    .from("fixed_points")
    .insert({ ...command, plan_id: planId })
    .select()
    .single();

  if (error) {
    logger.error("Failed to create fixed point", {
      planId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });
    throw new DatabaseError(
      "Failed to create fixed point. Please try again later.",
      new Error(error.message)
    );
  }

  logger.info("Fixed point created successfully", {
    fixedPointId: data.id,
    planId,
    userId,
  });

  return data;
};

/**
 * Retrieves all fixed points for a plan.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan
 * @param userId - The ID of the user requesting the fixed points
 * @returns Array of fixed points for the plan
 * @throws {NotFoundError} If the plan doesn't exist or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const getFixedPoints = async (
  supabase: SupabaseClient,
  planId: string,
  userId: string
): Promise<FixedPointDto[]> => {
  logger.debug("Fetching fixed points", { planId, userId });

  // First verify the plan exists and belongs to the user
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (planError || !plan) {
    logger.warn("Plan not found or unauthorized", {
      planId,
      userId,
      error: planError?.message,
    });
    throw new NotFoundError("Plan not found or you don't have access to it");
  }

  // Get fixed points
  const { data, error } = await supabase
    .from("fixed_points")
    .select("*")
    .eq("plan_id", planId)
    .order("event_at", { ascending: true });

  if (error) {
    logger.error("Failed to fetch fixed points", {
      planId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });
    throw new DatabaseError(
      "Failed to retrieve fixed points. Please try again later.",
      new Error(error.message)
    );
  }

  logger.info("Fixed points fetched successfully", {
    planId,
    userId,
    count: data?.length ?? 0,
  });

  return data ?? [];
};

/**
 * Updates a fixed point.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan
 * @param fixedPointId - The ID of the fixed point to update
 * @param command - The update data
 * @param userId - The ID of the user updating the fixed point
 * @returns The updated fixed point
 * @throws {NotFoundError} If the plan or fixed point doesn't exist or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const updateFixedPoint = async (
  supabase: SupabaseClient,
  planId: string,
  fixedPointId: string,
  command: UpdateFixedPointCommand,
  userId: string
): Promise<FixedPointDto> => {
  logger.debug("Updating fixed point", { planId, fixedPointId, userId });

  // First verify the plan exists and belongs to the user
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (planError || !plan) {
    logger.warn("Plan not found or unauthorized", {
      planId,
      userId,
      error: planError?.message,
    });
    throw new NotFoundError("Plan not found or you don't have access to it");
  }

  // Update the fixed point
  const { data, error } = await supabase
    .from("fixed_points")
    .update(command)
    .eq("id", fixedPointId)
    .eq("plan_id", planId)
    .select()
    .single();

  if (error) {
    logger.error("Failed to update fixed point", {
      planId,
      fixedPointId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });
    throw new DatabaseError(
      "Failed to update fixed point. Please try again later.",
      new Error(error.message)
    );
  }

  if (!data) {
    throw new NotFoundError("Fixed point not found");
  }

  logger.info("Fixed point updated successfully", {
    fixedPointId,
    planId,
    userId,
  });

  return data;
};

/**
 * Deletes a fixed point.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan
 * @param fixedPointId - The ID of the fixed point to delete
 * @param userId - The ID of the user deleting the fixed point
 * @throws {NotFoundError} If the plan or fixed point doesn't exist or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const deleteFixedPoint = async (
  supabase: SupabaseClient,
  planId: string,
  fixedPointId: string,
  userId: string
): Promise<void> => {
  logger.debug("Deleting fixed point", { planId, fixedPointId, userId });

  // First verify the plan exists and belongs to the user
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (planError || !plan) {
    logger.warn("Plan not found or unauthorized", {
      planId,
      userId,
      error: planError?.message,
    });
    throw new NotFoundError("Plan not found or you don't have access to it");
  }

  // Delete the fixed point
  const { error } = await supabase
    .from("fixed_points")
    .delete()
    .eq("id", fixedPointId)
    .eq("plan_id", planId);

  if (error) {
    logger.error("Failed to delete fixed point", {
      planId,
      fixedPointId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });
    throw new DatabaseError(
      "Failed to delete fixed point. Please try again later.",
      new Error(error.message)
    );
  }

  logger.info("Fixed point deleted successfully", {
    fixedPointId,
    planId,
    userId,
  });
};

