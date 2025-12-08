import type { SubmitFeedbackCommand, FeedbackDto } from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Service for managing user feedback on plans.
 */
export class FeedbackService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Submits or updates feedback for a plan (upsert operation).
   *
   * @param planId - The ID of the plan
   * @param userId - The ID of the user submitting feedback
   * @param command - The feedback data
   * @returns The created or updated feedback
   * @throws {DatabaseError} If the database operation fails
   */
  public async submitFeedback(
    planId: string,
    userId: string,
    command: SubmitFeedbackCommand
  ): Promise<FeedbackDto> {
    logger.debug("Submitting feedback", {
      planId,
      userId,
      rating: command.rating,
    });

    const { data, error } = await this.supabase
      .from("feedback")
      .upsert(
        {
          plan_id: planId,
          user_id: userId,
          rating: command.rating,
          comment: command.comment,
        },
        {
          onConflict: "plan_id,user_id",
        }
      )
      .select("rating, comment, updated_at")
      .single();

    if (error) {
      logger.error("Failed to submit feedback to database", {
        planId,
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError("Failed to submit feedback. Please try again later.", new Error(error.message));
    }

    logger.info("Feedback submitted successfully", {
      planId,
      userId,
    });

    return data;
  }

  /**
   * Retrieves feedback for a specific plan by the user.
   *
   * @param planId - The ID of the plan
   * @param userId - The ID of the user
   * @returns The feedback data
   * @throws {NotFoundError} If no feedback exists for this plan
   * @throws {DatabaseError} If the database operation fails
   */
  public async getFeedback(planId: string, userId: string): Promise<FeedbackDto> {
    logger.debug("Fetching feedback", {
      planId,
      userId,
    });

    const { data, error } = await this.supabase
      .from("feedback")
      .select("rating, comment, updated_at")
      .eq("plan_id", planId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // This is expected for newly generated plans - no feedback yet
        // Only log at debug level to avoid noise in logs
        logger.debug("No feedback found for plan (expected for new plans)", {
          planId,
          userId,
        });
        throw new NotFoundError("No feedback submitted for this plan.");
      }

      logger.error("Failed to fetch feedback from database", {
        planId,
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError("Failed to retrieve feedback. Please try again later.", new Error(error.message));
    }

    logger.info("Feedback fetched successfully", {
      planId,
      userId,
    });

    return data;
  }
}
