import { z } from "zod";

/**
 * Schema for validating fixed point creation requests.
 * Ensures that all required fields are present and properly formatted.
 */
export const createFixedPointSchema = z.object({
  location: z.string({ required_error: "Location is required." }).min(1, {
    message: "Location cannot be empty.",
  }),
  event_at: z.string({ required_error: "Event date and time is required." }).datetime({
    message: "Event date must be a valid ISO 8601 datetime string.",
  }),
  event_duration: z
    .number({
      required_error: "Event duration is required.",
      invalid_type_error: "Event duration must be a number.",
    })
    .int({ message: "Event duration must be an integer." })
    .positive({ message: "Event duration must be positive." }),
  description: z.string().optional().nullable(),
});

/**
 * Schema for validating fixed point update requests.
 * All fields are optional.
 */
export const updateFixedPointSchema = z.object({
  location: z.string().min(1, { message: "Location cannot be empty." }).optional(),
  event_at: z.string().datetime({
    message: "Event date must be a valid ISO 8601 datetime string.",
  }).optional(),
  event_duration: z
    .number()
    .int({ message: "Event duration must be an integer." })
    .positive({ message: "Event duration must be positive." })
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
});

