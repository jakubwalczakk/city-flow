import { z } from 'zod';

/**
 * Schema for user preferences form validation
 * Used in PreferencesForm component
 *
 * Note: travel_pace values must match TravelPace type in types.ts
 */
export const preferencesSchema = z.object({
  preferences: z
    .array(z.string())
    .min(2, 'Wybierz co najmniej 2 preferencje')
    .max(5, 'Możesz wybrać maksymalnie 5 preferencji'),
  travel_pace: z.enum(['slow', 'moderate', 'intensive'], {
    required_error: 'Wybierz tempo zwiedzania',
  }),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
