import type { CreatePlanCommand, PlanDetailsDto } from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";
import { DatabaseError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

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
