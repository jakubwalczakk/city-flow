import { z } from 'zod';

/**
 * Schema for validating fixed point creation requests.
 * Ensures that all required fields are present and properly formatted.
 */
export const createFixedPointSchema = z.object({
  location: z.string({ message: 'Location is required.' }).min(1, {
    message: 'Location cannot be empty.',
  }),
  event_at: z.string({ message: 'Event date and time is required.' }).datetime({
    message: 'Event date must be a valid ISO 8601 datetime string.',
  }),
  event_duration: z
    .preprocess(
      // transform "" or 0 to null, otherwise keep value
      (val) => (val === '' || val === 0 ? null : val),
      z
        .number({
          message: 'Event duration must be a number.',
        })
        .int({ message: 'Event duration must be an integer.' })
        .positive({ message: 'Event duration must be positive.' })
        .nullable()
    )
    .optional(),
  description: z.string().optional().nullable(),
});

/**
 * Schema for validating fixed point update requests.
 * All fields are optional.
 */
export const updateFixedPointSchema = z.object({
  location: z.string().min(1, { message: 'Location cannot be empty.' }).optional(),
  event_at: z
    .string()
    .datetime({
      message: 'Event date must be a valid ISO 8601 datetime string.',
    })
    .optional(),
  event_duration: z
    .preprocess(
      // transform "" or 0 to null, otherwise keep value
      (val) => (val === '' || val === 0 ? null : val),
      z
        .number({
          message: 'Event duration must be a number.',
        })
        .int({ message: 'Event duration must be an integer.' })
        .positive({ message: 'Event duration must be positive.' })
        .nullable()
    )
    .optional(),
  description: z.string().optional().nullable(),
});
