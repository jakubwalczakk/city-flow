import { z } from "zod";

/**
 * Schema for validating profile update requests.
 * All fields are optional to support partial updates (PATCH semantics).
 *
 * @property {string[]} [preferences] - Array of user's travel preferences (e.g., "Art & Museums", "Local Food").
 *                                     Must contain between 2 and 5 items when provided.
 * @property {("slow"|"moderate"|"intensive")} [travel_pace] - Desired pace of travel for itinerary generation.
 *                                                            - "slow": Relaxed pace with fewer activities
 *                                                            - "moderate": Balanced schedule
 *                                                            - "intensive": Packed itinerary with maximum activities
 * @property {boolean} [onboarding_completed] - Flag indicating whether the user has completed the onboarding process.
 *                                              Set to true after initial profile setup.
 *
 * @example
 * // Full update
 * {
 *   preferences: ["Art & Museums", "Local Food", "Nightlife"],
 *   travel_pace: "intensive",
 *   onboarding_completed: true
 * }
 *
 * @example
 * // Partial update (only travel_pace)
 * {
 *   travel_pace: "slow"
 * }
 */
export const updateProfileSchema = z.object({
  preferences: z
    .array(z.string())
    .min(2, "Must have at least 2 items.")
    .max(5, "Must have at most 5 items.")
    .optional(),
  travel_pace: z.enum(["slow", "moderate", "intensive"]).optional(),
  onboarding_completed: z.boolean().optional(),
});

/**
 * Type definition for profile update form data.
 * Inferred from the Zod schema to ensure type safety.
 */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
