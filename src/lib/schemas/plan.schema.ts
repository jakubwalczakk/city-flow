import { z } from 'zod';

/**
 * Base schema for a plan. This is the source of truth for the plan's shape.
 */
export const planSchema = z.object({
  name: z.string({ required_error: 'Nazwa jest wymagana.' }).min(1, {
    message: 'Nazwa nie może być pusta.',
  }),
  destination: z
    .string({ required_error: 'Miejsce docelowe jest wymagane.' })
    .min(1, { message: 'Miejsce docelowe nie może być puste.' }),
  start_date: z
    .string({ required_error: 'Data rozpoczęcia jest wymagana.' })
    .datetime({ message: 'Data rozpoczęcia musi być prawidłową datą.' }),
  end_date: z
    .string({ required_error: 'Data zakończenia jest wymagana.' })
    .datetime({ message: 'Data zakończenia musi być prawidłową datą.' }),
  notes: z.string().optional().nullable(),
});

/**
 * Schema for validating plan creation requests.
 * Ensures that all required fields are present and properly formatted.
 * Note: start_date and end_date are required and must be in ISO 8601 datetime format.
 */
export const createPlanSchema = planSchema.refine(
  (data) => {
    // end_date must be after or equal to start_date
    return new Date(data.end_date) >= new Date(data.start_date);
  },
  {
    message: 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia.',
    path: ['end_date'],
  }
);

/**
 * Schema for validating query parameters for listing plans.
 * Ensures pagination, filtering, and sorting parameters are valid.
 *
 * Uses `statuses` parameter for filtering by status (supports single or multiple values).
 */
export const listPlansQuerySchema = z.object({
  statuses: z.preprocess(
    (val) => {
      // Handle null or undefined
      if (!val) return undefined;

      // If it's a string with commas, split it
      if (typeof val === 'string' && val.includes(',')) {
        return val.split(',').map((s) => s.trim());
      }

      // Otherwise return as-is (single value as array)
      if (typeof val === 'string') {
        return [val];
      }

      return val;
    },
    z.array(z.enum(['draft', 'generated', 'archived'])).optional()
  ),
  sort_by: z.enum(['created_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce
    .number()
    .int()
    .min(1, { message: 'Limit musi wynosić co najmniej 1.' })
    .max(100, { message: 'Limit nie może przekraczać 100.' })
    .default(20),
  offset: z.coerce.number().int().min(0, { message: 'Offset nie może być ujemny.' }).default(0),
});

/**
 * Schema for validating basic info step in the create plan form (client-side).
 * Uses Date objects instead of strings for easier form handling.
 * Note: start_date and end_date are required fields.
 */
export const basicInfoSchema = z
  .object({
    name: z.string().min(1, 'Nazwa planu jest wymagana'),
    destination: z.string().min(1, 'Miejsce docelowe jest wymagane'),
    start_date: z.date({ required_error: 'Data rozpoczęcia jest wymagana' }),
    end_date: z.date({ required_error: 'Data zakończenia jest wymagana' }),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      return data.end_date >= data.start_date;
    },
    {
      message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia',
      path: ['end_date'],
    }
  );

/**
 * Schema for validating fixed point form (client-side).
 */
export const fixedPointSchema = z.object({
  location: z.string().min(1, 'Lokalizacja jest wymagana'),
  event_at: z.string().datetime({ message: 'Nieprawidłowy format daty' }),
  event_duration: z
    .number({ invalid_type_error: 'Czas trwania musi być liczbą.' })
    .int({ message: 'Czas trwania musi być liczbą całkowitą.' })
    .positive('Czas trwania musi być liczbą dodatnią.')
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for validating plan update requests.
 * Ensures that all fields are properly formatted.
 */
export const updatePlanSchema = z
  .object({
    name: z.string().min(1, 'Nazwa nie może być pusta.').optional(),
    start_date: z.string().datetime({ message: 'Data rozpoczęcia musi być prawidłową datą.' }).optional(),
    end_date: z.string().datetime({ message: 'Data zakończenia musi być prawidłową datą.' }).optional(),
    notes: z.string().optional().nullable(),
    status: z.enum(['draft', 'generated', 'archived']).optional(),
  })
  .refine(
    (data) => {
      // If both dates are provided, end_date must be after or equal to start_date
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia.',
      path: ['end_date'],
    }
  );

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type FixedPointFormData = z.infer<typeof fixedPointSchema>;
