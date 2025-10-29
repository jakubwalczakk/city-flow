import type { CreatePlanCommand, PlanDetailsDto, PaginatedPlansDto, PlanStatus } from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";
import { DatabaseError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Parameters for listing plans.
 */
export type GetPlansParams = {
  status?: PlanStatus;
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
    query = query.eq("status", params.status);
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
