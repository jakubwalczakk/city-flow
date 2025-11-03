import type { CreatePlanCommand, UpdatePlanCommand, PlanDetailsDto, PaginatedPlansDto, PlanStatus } from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Parameters for listing plans.
 */
export type GetPlansParams = {
  status?: PlanStatus | PlanStatus[];
  sort_by: "created_at" | "name";
  order: "asc" | "desc";
  limit: number;
  offset: number;
};

/**
 * Creates a new travel plan in the database.
 *
 * @param supabase - The Supabase client instance
 * @param command - The plan creation data
 * @param userId - The ID of the user creating the plan
 * @returns The newly created plan
 * @throws {DatabaseError} If the database operation fails
 */
export const createPlan = async (
  supabase: SupabaseClient,
  command: CreatePlanCommand,
  userId: string
): Promise<PlanDetailsDto> => {
  logger.debug("Creating new plan", {
    userId,
    destination: command.destination,
  });

  const { data, error } = await supabase
    .from("plans")
    .insert({ ...command, user_id: userId, status: "draft" })
    .select()
    .single();

  if (error) {
    logger.error("Failed to create plan in database", {
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });

    throw new DatabaseError("Failed to create a plan. Please try again later.", new Error(error.message));
  }

  logger.info("Plan created successfully", {
    planId: data.id,
    userId,
  });

  return data;
};

/**
 * Retrieves a paginated list of plans for a user.
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the user whose plans to retrieve
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns A paginated list of plans
 * @throws {DatabaseError} If the database operation fails
 */
export const getPlans = async (
  supabase: SupabaseClient,
  userId: string,
  params: GetPlansParams
): Promise<PaginatedPlansDto> => {
  logger.debug("Fetching plans list", {
    userId,
    params,
  });

  // Build the base query
  let query = supabase
    .from("plans")
    .select("id, name, destination, start_date, end_date, status, created_at", { count: "exact" })
    .eq("user_id", userId);

  // Apply status filter if provided
  if (params.status) {
    if (Array.isArray(params.status)) {
      query = query.in("status", params.status);
    } else {
      query = query.eq("status", params.status);
    }
  }

  // Apply sorting
  query = query.order(params.sort_by, { ascending: params.order === "asc" });

  // Apply pagination
  const from = params.offset;
  const to = params.offset + params.limit - 1;
  query = query.range(from, to);

  // Execute the query
  const { data, error, count } = await query;

  if (error) {
    logger.error("Failed to fetch plans from database", {
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });

    throw new DatabaseError("Failed to retrieve plans. Please try again later.", new Error(error.message));
  }

  logger.info("Plans fetched successfully", {
    userId,
    count: data?.length ?? 0,
    total: count ?? 0,
  });

  return {
    data: data ?? [],
    pagination: {
      total: count ?? 0,
      limit: params.limit,
      offset: params.offset,
    },
  };
};

/**
 * Retrieves detailed information about a specific plan.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan to retrieve
 * @param userId - The ID of the user who owns the plan
 * @returns The plan details
 * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const getPlanById = async (
  supabase: SupabaseClient,
  planId: string,
  userId: string
): Promise<PlanDetailsDto> => {
  logger.debug("Fetching plan by ID", {
    planId,
    userId,
  });

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      logger.warn("Plan not found", {
        planId,
        userId,
      });
      throw new NotFoundError("Plan not found.");
    }

    logger.error("Failed to fetch plan from database", {
      planId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });

    throw new DatabaseError("Failed to retrieve plan. Please try again later.", new Error(error.message));
  }

  logger.info("Plan fetched successfully", {
    planId,
    userId,
  });

  return data;
};

/**
 * Updates an existing plan.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan to update
 * @param userId - The ID of the user who owns the plan
 * @param command - The update data
 * @returns The updated plan
 * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const updatePlan = async (
  supabase: SupabaseClient,
  planId: string,
  userId: string,
  command: UpdatePlanCommand
): Promise<PlanDetailsDto> => {
  logger.debug("Updating plan", {
    planId,
    userId,
  });

  // First, verify the plan exists and belongs to the user
  await getPlanById(supabase, planId, userId);

  const { data, error } = await supabase
    .from("plans")
    .update(command)
    .eq("id", planId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    logger.error("Failed to update plan in database", {
      planId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });

    throw new DatabaseError("Failed to update plan. Please try again later.", new Error(error.message));
  }

  logger.info("Plan updated successfully", {
    planId,
    userId,
  });

  return data;
};

/**
 * Deletes a plan.
 *
 * @param supabase - The Supabase client instance
 * @param planId - The ID of the plan to delete
 * @param userId - The ID of the user who owns the plan
 * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
 * @throws {DatabaseError} If the database operation fails
 */
export const deletePlan = async (
  supabase: SupabaseClient,
  planId: string,
  userId: string
): Promise<void> => {
  logger.debug("Deleting plan", {
    planId,
    userId,
  });

  // First, verify the plan exists and belongs to the user
  await getPlanById(supabase, planId, userId);

  const { error } = await supabase
    .from("plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);

  if (error) {
    logger.error("Failed to delete plan from database", {
      planId,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
    });

    throw new DatabaseError("Failed to delete plan. Please try again later.", new Error(error.message));
  }

  logger.info("Plan deleted successfully", {
    planId,
    userId,
  });
};
