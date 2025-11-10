import type { SupabaseClient } from "../../db/supabase.client";
import type { UpdateProfileCommand } from "../../types";
import { DatabaseError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

/**
 * Service responsible for managing user profile operations.
 * Handles database interactions for the profiles table.
 */
export class ProfileService {
  /**
   * Retrieves a user's profile by their user ID.
   * 
   * @param supabase - Supabase client instance
   * @param userId - The unique identifier of the user
   * @returns The user's profile if found, null if not found
   * @throws Error if the database operation fails (excluding not found errors)
   * 
   * @example
   * ```typescript
   * const profile = await ProfileService.findProfileByUserId(supabase, "user-uuid");
   * if (!profile) {
   *   console.log("Profile not found");
   * }
   * ```
   */
  static async findProfileByUserId(supabase: SupabaseClient, userId: string) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // PGRST116 is the Postgrest error code for "no rows found"
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return profile;
  }

  /**
   * Updates a user's profile with the provided data.
   * All fields in the data object are optional, enabling partial updates (PATCH semantics).
   * The `updated_at` timestamp is automatically set to the current time.
   *
   * @param supabase - Supabase client instance
   * @param userId - The ID of the user whose profile is being updated
   * @param data - The profile fields to update (all optional)
   * @param data.preferences - Array of travel preferences (2-5 items)
   * @param data.travel_pace - Travel pace preference ("slow", "moderate", or "intensive")
   * @param data.onboarding_completed - Whether the user has completed onboarding
   * @returns The updated profile object with all fields
   * @throws DatabaseError if the update operation fails
   * 
   * @example
   * ```typescript
   * // Update only travel pace
   * const profile = await ProfileService.updateProfile(supabase, userId, {
   *   travel_pace: "intensive"
   * });
   * 
   * // Complete onboarding with preferences
   * const profile = await ProfileService.updateProfile(supabase, userId, {
   *   preferences: ["Art & Museums", "Local Food"],
   *   travel_pace: "moderate",
   *   onboarding_completed: true
   * });
   * ```
   */
  static async updateProfile(
    supabase: SupabaseClient,
    userId: string,
    data: UpdateProfileCommand
  ) {
    logger.debug("Updating profile", { userId, data });

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update profile", { userId, error: error.message }, error);
      throw new DatabaseError("Failed to update profile.", error);
    }

    logger.debug("Profile updated successfully", { userId });
    return updatedProfile;
  }
}
