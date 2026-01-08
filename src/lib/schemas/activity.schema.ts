import { z } from 'zod';

/**
 * Schema for activity form validation
 * Used in ActivityForm component for adding/editing activities
 */
export const activitySchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(200, 'Tytuł może mieć maksymalnie 200 znaków'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Nieprawidłowy format czasu')
    .optional()
    .or(z.literal('')),
  category: z.enum(['history', 'food', 'sport', 'nature', 'culture', 'transport', 'accommodation', 'other'], {
    message: 'Kategoria jest wymagana',
  }),
  location: z.string().max(200, 'Lokalizacja może mieć maksymalnie 200 znaków').optional().or(z.literal('')),
  description: z.string().max(1000, 'Opis może mieć maksymalnie 1000 znaków').optional().or(z.literal('')),
  estimated_price: z.string().max(50, 'Cena może mieć maksymalnie 50 znaków').optional().or(z.literal('')),
  estimated_duration: z.string().regex(/^\d*$/, 'Wprowadź tylko liczbę').optional().or(z.literal('')),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

/**
 * Transform activity form data to API format
 */
export function transformActivityFormData(data: ActivityFormData) {
  return {
    title: data.title,
    time: data.time || undefined,
    category: data.category,
    location: data.location || undefined,
    description: data.description || undefined,
    estimated_price: data.estimated_price || undefined,
    estimated_duration: data.estimated_duration ? `${data.estimated_duration} min` : undefined,
    duration: data.estimated_duration ? parseInt(data.estimated_duration, 10) : undefined,
  };
}
